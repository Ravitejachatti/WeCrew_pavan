import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  SafeAreaView,
  NativeModules, 
  PermissionsAndroid, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { ref, set, remove, onValue, get } from 'firebase/database';
import { db } from '../../firebaseConfig';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useRequest } from '../../contexts/RequestContext';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from '../../constants/constants';
import MasterBottomNavigator from '../../components/MasterBottomNavigator';
import MasterRequestStatusRedirectButton from '../../components/MasterRequestStatusRedirectButton';
import LoadingBars from '../../components/reuableComponents/loadingBars';
import { useNavigation } from '@react-navigation/native';


import messaging from '@react-native-firebase/messaging';
import WeCrewPermissionsGate from '../../components/reuableComponents/masterPermissions';

const { BackgroundLocationModule } = NativeModules;
console.log('LocationModule:', NativeModules.BackgroundLocationModule);

const MasterHomeScreen = () => {
  const [ permsDone, setPermsDone ] = useState('false')
  const { user } = useAuth();
  const navigation = useNavigation();
  const { isOnDuty, updateDutyStatus } = useRequest();
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [masterName, setMasterName] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [servicesDone, setServicesDone] = useState(0);
  const [recentEarning, setRecentEarning] = useState(0);
  const [avgRating, setAvgRating] = useState('--');
  const [recentRequest, setRecentRequest] = useState(null);
  const [ongoingRequest, setOngoingRequest] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = `${API}`;
  const [userData, setUserData] = useState(null);

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     Alert.alert('New Request', remoteMessage.notification?.body);
  //     // optionally navigate to request screen
  //   });

  //   return unsubscribe;
  // }, []);

  if(!permsDone){
    return <WeCrewPermissionsGate onReady={() => setPermsDone(true)}/>
  }

  useEffect(() => {
    const fetchMasterName = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
    
        if (data) {
          setUserData(JSON.parse(data));
          setMasterName(JSON.parse(data).name || '');
          console.log(userData);
        }
      } catch (error) {
        console.error('Error fetching master name:', error);
      }
    };
    fetchMasterName();
  }, []);

  useEffect(() => {
    if (user) {
      setMasterName(user.name || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userData?._id) return;
      try {
        setAnalyticsLoading(true);
        console.log("Fetching analytics for user:", userData._id);
        const res = await axios.get(`${BASE_URL}/master/${userData._id}/analytics`);
        const data = res.data.analytics;
        setTotalEarnings(data.totalEarnings || 0);
        setServicesDone(data.completed?.length || 0);
        setAvgRating(data.avgRating || '--');
        setRecentEarning(data.completed?.at(-1)?.amount || 0);
        setRecentRequest(data.completed?.at(-1) || null);
        await AsyncStorage.setItem('MasterAnalytics', JSON.stringify(data));
      } catch (e) {
        setTotalEarnings(0);
        setServicesDone(0);
        setAvgRating('--');
        setRecentEarning(0);
        console.error("fetching analytics",e);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [userData?._id]);

  useEffect(() => {
    let unsubscribe;

    const listenForOngoingRequest = async () => {
      if (!userData?._id) return;
      console.log("Listening for ongoing requests for user:", userData._id);
      const ongoingRef = ref(db, `masterRequests/${userData._id}`);
      console.log("Listening for ongoing requests at:", ongoingRef.toString());
      onValue(ongoingRef, async (snapshot) => {
        const acceptedRequest = snapshot.val();
        console.log("✅ acceptedRequest raw snapshot:", acceptedRequest);

        if (acceptedRequest) {
          const requestId = Object.keys(acceptedRequest)[0];
          const requestData = acceptedRequest[requestId];
          setRequest(requestData);
          console.log("✅ Extracted requestId:", requestId);

          const requestRef = ref(db, `ongoingMasters/${requestId}`);
          onValue(requestRef, (snap) => {
            const data = snap.val();
            console.log("✅ ongoingRequest from ongoingMasters:", data);
            setOngoingRequest(data || null);
          });
        } else {
          console.warn("⛔ No accepted request found");
          setOngoingRequest(null);
        }
      });
    };

    listenForOngoingRequest();

    return () => unsubscribe?.();
  }, [userData?._id]);

  useEffect(() => {
    const fetchRecentCompleted = async () => {
      setLoading(true);
      const str = await AsyncStorage.getItem('MasterAnalytics');
      const data = JSON.parse(str);
      setRecentRequest(data?.completed?.at(-1) || null);
      setLoading(false);
    };
    fetchRecentCompleted();
  }, [user?._id]);

  useEffect(() => {
    if (ongoingRequest && !isOnDuty) {
      // Automatically set master ON DUTY if not already
      updateDutyStatus(true);

      if (userData?._id) {
        set(ref(db, `masters/${userData._id}/active`), true);
      }
    }
  }, [ongoingRequest]);

  // ✅ FIXED: Proper location tracking management
  useEffect(() => {
    const manageLocationTracking = async () => {
      if (Platform.OS === 'android') {
        // Request permissions
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;

        if (isOnDuty && userData?._id) {
          try {
            console.log('🟢 Starting location tracking for user:', userData._id);
            
            // Get initial location
            const location = await Location.getCurrentPositionAsync({ 
              accuracy: Location.Accuracy.High 
            });
            const { latitude, longitude } = location.coords;
            setLat(latitude);
            setLon(longitude);

            // Set initial Firebase location (this will be updated by the service)
            await set(ref(db, `masters/${userData._id}`), {
              location: {
                lat: latitude,
                lon: longitude,
                timestamp: Date.now(),
              },
              active: true,
            });

            // ✅ Start background service with proper error handling
            try {
              const result = await BackgroundLocationModule.startLocationService({
                taskTitle: 'Tracking in progress',
                taskDesc: 'We are tracking your location',
                userId: userData._id, // This is crucial for the service
              });
              console.log('✅ Location service started:', result);
            } catch (error) {
              console.error('❌ Location service start error:', error);
              Alert.alert('Location Error', 'Failed to start location tracking');
            }

          } catch (err) {
            console.error("❌ Location tracking error:", err);
          }
        } else {
          console.log('🔴 Stopping location tracking');
          
          // Stop background service
          try {
            const result = await BackgroundLocationModule.stopLocationService();
            console.log('✅ Location service stopped:', result);
          } catch (error) {
            console.error('❌ Location service stop error:', error);
          }

          // Remove from Firebase or set inactive
          if (userData?._id) {
            await set(ref(db, `masters/${userData._id}`), {
              active: false,
              location: null, // Clear location when off duty
            });
          }
        }
      }
    };

    manageLocationTracking();
  }, [isOnDuty, userData?._id]);

  // ✅ FIXED: Better duty toggle with proper error handling
  const handleDutyToggle = async (value) => {
    if (ongoingRequest && !value) {
      Alert.alert("Cannot go OFF DUTY", "You have an ongoing request. Complete it first.");
      return;
    }

    try {
      console.log(`🔄 Toggling duty status to: ${value ? 'ON' : 'OFF'}`);
      
      // Update local state first
      updateDutyStatus(value);

      // Update Firebase active status
      if (userData?._id) {
        await set(ref(db, `masters/${userData._id}/active`), value);
        console.log(`✅ Firebase active status updated to: ${value}`);
      }

    } catch (error) {
      console.error('❌ Error toggling duty status:', error);
      Alert.alert('Error', 'Failed to update duty status');
      // Revert local state if Firebase update fails
      updateDutyStatus(!value);
    }
  };

  // ✅ ADDED: Listen to location updates from the service (optional)
  useEffect(() => {
    const locationUpdateListener = (location) => {
      console.log('📍 Location update received:', location);
      setLat(location.latitude);
      setLon(location.longitude);
    };

    // You can add a native event listener here if needed
    // DeviceEventEmitter.addListener('locationUpdate', locationUpdateListener);

    return () => {
      // DeviceEventEmitter.removeListener('locationUpdate', locationUpdateListener);
    };
  }, []);

  console.log('recent request', recentRequest);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.topRow}>
          <View style={styles.locationBlock}>
          <TouchableOpacity onPress={() => navigation.navigate('MasterProfileScreen')}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
          </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Current location</Text>
              <Text style={styles.locationText}>
                {lat && lon ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : 'Fetching...'}
              </Text>
            </View>
          </View>
          <View style={styles.dutyBlock}>
            <Text style={styles.dutyText}>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</Text>
            <Switch
              value={isOnDuty}
              onValueChange={handleDutyToggle}
              trackColor={{ false: '#ccc', true: COLORS.primary }}
              thumbColor={isOnDuty ? '#fff' : '#f4f3f4'}
              disabled={!!ongoingRequest} 
            />
          </View>
        </View>

        {/* Profile Card */}
     <View style={styles.masterCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.welcomeText}>Welcome back {masterName || 'Master'} 👋</Text>
      <Text style={styles.masterIdText}>Master ID: #{userData?._id?.slice(-4) || '----'}</Text>
      <Text style={styles.startNote}>Start ON DUTY to start earning!</Text>
    </View>
  </View>

        {/* Stats */}
        {analyticsLoading ? (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <LoadingBars color={COLORS.primary} size={36} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsBox}><Text style={styles.statsValue}>₹ {totalEarnings}</Text><Text style={styles.statsLabel}>Total Earnings</Text></View>
            <View style={styles.statsBox}><Text style={styles.statsValue}>{servicesDone}</Text><Text style={styles.statsLabel}>Services Done</Text></View>
            <View style={styles.statsBox}><Text style={styles.statsValue}>₹ {recentEarning}</Text><Text style={styles.statsLabel}>Recent Earning</Text></View>
            <View style={styles.statsBox}><Text style={styles.statsValue}>{avgRating}</Text><Text style={styles.statsLabel}>Avg Rating</Text></View>
          </View>
        )}

        {/* Booking Info */}
        <Text style={styles.sectionTitle}>
          {ongoingRequest ? 'Ongoing Request' : 'Recent Completed Request'}
        </Text>
        {loading ? (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <LoadingBars color={COLORS.primary} size={36} />
          </View>
        ) : ongoingRequest ? (
          <View style={styles.bookingCard}>
            {/* Live red marker */}
            <View style={styles.liveMarkerRow}>
              <View style={styles.livePulse} />
            </View>

            <View style={styles.pickupRow}>
              <Ionicons name="radio-button-on" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Pickup Address</Text>   
                <Text style={styles.detailValue}>{request?.location?.address}</Text>
              </View>
              <Text style={styles.directions}>Directions</Text>
            </View>

            <View style={styles.bookingDetailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Vehicle Number</Text>
                <Text style={styles.detailValue}>{request.user?.vehicleNumber}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Vehicle Model</Text>
                <Text style={styles.detailValue}>{request.user?.vehicleModel}</Text>
              </View>
            </View>

            <View style={styles.bookingDetailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Service Requested</Text>
                <Text style={styles.detailValue}>{request.serviceType}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={styles.detailValue}>₹ {request.amount?.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        ) : recentRequest ? (
          <View style={styles.bookingCard}>
            <View style={styles.bookingDetailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Vehicle Number</Text>
                <Text style={styles.detailValue}>{recentRequest.vehicleNumber}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Vehicle Model</Text>
                <Text style={styles.detailValue}>{recentRequest.vehicleName}</Text>
              </View>
            </View>

            <View style={styles.bookingDetailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Service Requested</Text>
                <Text style={styles.detailValue}>{recentRequest?.serviceType}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={styles.detailValue}>₹ {recentRequest.amount?.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text>No recent activity</Text>
        )}

        <MasterRequestStatusRedirectButton ongoingRequest={ongoingRequest} />
        <MasterBottomNavigator />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  
  container: { flexGrow: 1, padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  locationBlock: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  label: { fontSize: 12, color: '#888' },
  locationText: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  dutyBlock: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAF4FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  dutyText: { color: COLORS.primary, fontWeight: 'bold', marginRight: 8 },
  masterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 20 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  masterName: { fontSize: 16, fontWeight: 'bold' },
  masterId: { fontSize: 12, color: '#666' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statsBox: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  statsValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  statsLabel: { fontSize: 12, color: '#888' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },

  bookingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 20,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  address: {
    fontSize: 13,
    color: '#555',
  },
  directions: {
    color: COLORS.primary,
    fontSize: 12,
    alignSelf: 'flex-start',
  },
  bookingDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailColumn: {
    width: '48%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  profileAndLocationBlock: {
  flexDirection: 'row',
},
welcomeText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#111',
},
masterIdText: {
  fontSize: 12,
  color: '#666',
  marginBottom: 4,
},
startNote: {
  fontSize: 12,
  fontStyle: 'italic',
  color: COLORS.primary,
  marginBottom: 8,
},
locationLabel: {
  fontSize: 12,
  color: '#888',
},
});

export default MasterHomeScreen;
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MasterBottomNavigator from '../../components/MasterBottomNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebaseConfig';
import { ref, set, remove, onValue, get} from "firebase/database";
import * as Location from 'expo-location';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useRequest } from '../../contexts/RequestContext';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../../constants/constants";
import MasterRequestStatusRedirectButton from '../../components/MasterRequestStatusRedirectButton';
import { use } from 'react';

const MasterHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  const { isOnDuty, updateDutyStatus } = useRequest();
  const [hasAcceptedRequest, setHasAcceptedRequest] = useState(false);
  const [masterName, setMasterName] = useState('');
  const [lat, setLat] = useState(null); 
  const [lon, setLon] = useState(null); 
  const [loading, setLoading] = useState(true);
  //stats
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [servicesDone, setServicesDone] = useState(0);
  const [recentEarning, setRecentEarning] = useState(0);
  const [avgRating, setAvgRating] = useState("--");

  const [recentRequest, setRecentRequest] = useState(null);

  const BASE_URL = `${API}`;

  
  // Set master name from user async storage
  useEffect(() => {
    const fetchMasterName = async () => {
      try {
        const user = await AsyncStorage.getItem('userData');
        if (user) {
          const parsedUser = JSON.parse(user);
          setMasterName(parsedUser.name || '');
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

  // Fetch analytics for stats
  useEffect(() => {
  const fetchAnalytics = async () => {
    if (!user?._id) return;
    try {
      const response = await axios.get(`${BASE_URL}/master/${user._id}/analytics`);
      if (response.data && response.data.status && response.data.analytics) {
        const analytics = response.data.analytics;
        setTotalEarnings(analytics.totalEarnings || 0);
        setServicesDone(Array.isArray(analytics.completed) ? analytics.completed.length : 0);
        setAvgRating(analytics.avgRating || "--");
        if (Array.isArray(analytics.completed) && analytics.completed.length > 0) {
          setRecentEarning(analytics.completed[analytics.completed.length - 1].amount || 0);
        } else {
          setRecentEarning(0);
        }
        // Store analytics in AsyncStorage
        await AsyncStorage.setItem('MasterAnalytics', JSON.stringify(analytics));
      }
    } catch (e) {
      setTotalEarnings(0);
      setServicesDone(0);
      setAvgRating("--");
      setRecentEarning(0);
      Alert.alert("something went wrong", e?.message || String(e));
      console.log(error.response.data)
    }
  };
  fetchAnalytics();
}, [user?._id]);

  //fetching the recent completed request
useEffect(() => {
  const fetchRecentCompleted = async () => {
    setLoading(true);
    try {
      const analyticsStr = await AsyncStorage.getItem("MasterAnalytics");
      if (analyticsStr) {
        const analytics = JSON.parse(analyticsStr);
        if (
          analytics.completed &&
          Array.isArray(analytics.completed) &&
          analytics.completed.length > 0
        ) {
          setRecentRequest(analytics.completed[analytics.completed.length - 1]);
        } else {
          setRecentRequest(null);
        }
      } else {
        setRecentRequest(null);
      }
    } catch (e) {
      setRecentRequest(null);
    } finally {
      setLoading(false);
    }
  };
  fetchRecentCompleted();
}, [user?._id]);

  // Get real-time location every second when ON DUTY
  useEffect(() => {
    let locationInterval = null;
    let isMounted = true;

    const getLocationAndUpdate = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for ON DUTY.');
          return;
        }
        locationInterval = setInterval(async () => {
          let location = await Location.getCurrentPositionAsync({});
          if (isMounted) {
            setLat(location.coords.latitude);
            setLon(location.coords.longitude);
            // Update Firebase with new location if ON DUTY and masterId exists
            if (isOnDuty && user?._id) {
              await set(ref(db, `masters/${user._id}`), {
                active: true,
                lat: location.coords.latitude,
                lon: location.coords.longitude,
              });
            }
          }
        }, 1000);
      } catch (e) {
        // Handle error
      }
    };

    if (isOnDuty) {
      getLocationAndUpdate();
    } else {
      // Remove from Firebase when OFF DUTY
      if (user?._id) {
        remove(ref(db, `masters/${user._id}`));
      }
    }

    return () => {
      isMounted = false;
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [isOnDuty, user?._id]);

  // Handle On Duty toggle
  const handleDutyToggle = async (value) => {
  updateDutyStatus(value);
  if (user?._id) {
    if (value) {
      await set(ref(db, `masters/${user._id}/active`), true);
    } else {
      await set(ref(db, `masters/${user._id}`), { active: false });
    }
  }
}; 

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color="#000" />
            <Text style={styles.locationText}>
              {lat && lon ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : "Fetching location..."}
            </Text>
          </View>
          {/* Toggle On Duty / Off Duty */}
          <View style={styles.toggleContainer}>
            <Switch
              value={isOnDuty}
              onValueChange={handleDutyToggle}
              trackColor={{ false: '#ccc', true: '#007bff' }}
              thumbColor={isOnDuty ? '#fff' : '#f4f3f4'}
            />
            <Text style={[styles.toggleText, { color: isOnDuty ? '#007bff' : '#777' }]}>
              {isOnDuty ? 'ON DUTY' : 'OFF DUTY'} 
            </Text>
          </View>

          {/* Conditionally show lightning icon only when ON DUTY */}
          {isOnDuty && <Ionicons name="flash-outline" size={24} color="#007bff" />}
        </View>

        {/* Master Info */}
        <View style={styles.masterCard}>
          <Image
            source={require('../../assets/bullet350.png')}
            style={styles.profileImage}
          />
          <View style={styles.masterInfo}>
            <Text style={styles.masterName}>{masterName || "Master"}</Text>
            <Text style={styles.masterId}>Master ID: #{user?._id ? user._id.slice(-4) : "----"}</Text>
          </View>
          <View style={styles.shieldIconContainer}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#28a745" />
          </View>
        </View>

         {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue}>₹ {totalEarnings}</Text>
            <Text style={styles.statsLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue}>{servicesDone}</Text>
            <Text style={styles.statsLabel}>Services Done</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue}>₹ {recentEarning}</Text>
            <Text style={styles.statsLabel}>Recent Earning</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue}>{avgRating}</Text>
            <Text style={styles.statsLabel}>Avg Rating</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Completed Request</Text>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#007BFF" />
            </View>
          ) : recentRequest ? (
            <View style={styles.bookingCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.serviceType}>{recentRequest.serviceType || "---"}</Text>
                <Text style={styles.amount}>₹ {recentRequest.amount || "0"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Image
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/189/189792.png" }}
                  style={styles.vehicleIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleText}>{recentRequest.vehicleName || "---"}</Text>
                  <Text style={styles.vehicleNumber}>{recentRequest.vehicleNumber || "---"}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.dateLabel}>
                  {recentRequest.date ? new Date(recentRequest.date).toLocaleString() : "---"}
                </Text>
              </View>
              {recentRequest.userRating && (
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Your Rating:</Text>
                  <Text style={styles.ratingValue}>{recentRequest.userRating} ⭐</Text>
                </View>
              )}
              {recentRequest.userFeedback && (
                <Text style={styles.feedback}>"{recentRequest.userFeedback}"</Text>
              )}
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No completed requests yet.</Text>
            </View>
          )}

        {/* Tracking current Repair Request */}
        <MasterRequestStatusRedirectButton/>

        {/* Bottom Navigation */}
        <MasterBottomNavigator />
      </ScrollView>
    </SafeAreaView>
  );
};

// ...existing code...
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin / 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 5,
    fontSize: FONTS.small,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.regular,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  toggleText: {
    marginLeft: 8,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.small,
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding - 5,
    borderRadius: SIZES.borderRadius,
    shadowColor: COLORS.textDark,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: SIZES.margin / 2,
    justifyContent: 'space-between',
  },
  profileImage: {
    width: SIZES.avatarSize + 10,
    height: SIZES.avatarSize + 10,
    borderRadius: (SIZES.avatarSize + 10) / 2,
    marginRight: 14,
  },
  masterInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shieldIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  masterName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
    color: COLORS.textDark,
  },
  masterId: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.regular,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsBox: {
    width: '48%',
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding - 5,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.margin / 2,
    shadowColor: COLORS.textDark,
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statsValue: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.large,
    color: COLORS.primary,
  },
  statsLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.regular,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontFamily: FONT_FAMILY.bold,
    marginVertical: SIZES.margin / 2,
    color: COLORS.textDark,
  },
  bookingCard: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding - 2,
    borderRadius: SIZES.borderRadius,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: SIZES.margin,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  pickupText: {
    fontSize: FONTS.small,
    fontFamily: FONT_FAMILY.bold,
    marginLeft: 5,
    color: COLORS.textDark,
  },
  directions: {
    marginLeft: 'auto',
    fontSize: FONTS.small,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
  },
  address: {
    fontSize: FONTS.small,
    color: COLORS.text,
    marginBottom: 10,
    fontFamily: FONT_FAMILY.regular,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: FONTS.small,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
  },
  value: {
    fontSize: FONTS.small,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceType: {
    fontSize: FONTS.medium + 2,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.toggleActive,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
    borderRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vehicleIcon: {
    width: SIZES.avatarSize,
    height: SIZES.avatarSize,
    marginRight: 12,
    tintColor: COLORS.primary,
  },
  vehicleText: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  vehicleNumber: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: 2,
    fontFamily: FONT_FAMILY.regular,
  },
  statusPill: {
    backgroundColor: "#E6F4EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  statusText: {
    color: COLORS.toggleActive,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.small,
  },
  dateLabel: {
    fontSize: FONTS.small,
    color: COLORS.text,
    marginTop: 6,
    fontStyle: "italic",
    fontFamily: FONT_FAMILY.regular,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginRight: 4,
    fontFamily: FONT_FAMILY.regular,
  },
  ratingValue: {
    fontSize: FONTS.small,
    color: "#FFD700",
    fontFamily: FONT_FAMILY.bold,
  },
  feedback: {
    fontSize: FONTS.medium,
    color: COLORS.textDark,
    marginTop: 4,
    fontStyle: "italic",
    fontFamily: FONT_FAMILY.regular,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SIZES.margin,
  },
  emptyText: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    textAlign: "center",
    fontFamily: FONT_FAMILY.bold,
  },
});

export default MasterHomeScreen;
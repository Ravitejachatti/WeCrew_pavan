import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import SlideToConfirm from '../../components/reuableComponents/slidebar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'http://10.156.44.93:3000/api'; // Replace with your actual base URL

const MasterRepairCompleted = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(true);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      setInitialLoading(true);
      try {
        const stored = await AsyncStorage.getItem('AcceptedRequest');
        if (stored) {
          const parsed = JSON.parse(stored);
          setRequest(parsed);
          console.log("Fetched request for completion:", parsed);
        }
      } catch (error) {
        console.error("Error fetching request:", error);
        Alert.alert('Error', 'Failed to load request details.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchRequest();
  }, []);

  const handleCompleteRepair = async () => {
    console.log("Handle complete repair triggered");
    
    if (!request?.requestId) {
      Alert.alert('Error', 'Request ID not found.');
      return;
    }

    // Confirm action with user
    Alert.alert(
      'Confirm Completion', 
      'Are you sure you want to mark this repair as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => performCompleteRepair() }
      ]
    );
  };

  const performCompleteRepair = async () => {
    setLoading(true);
    try {
      console.log(`Completing repair for request ID: ${request.requestId}`);
      
      const response = await axios.patch(
        `${BASE_URL}/request/${request.requestId}/complete-repair`
      );
      
      console.log("Complete repair API response:", response.data);

      if (response.status === 200 && response.data.status) {
        // Clear the stored request since it's completed
        await AsyncStorage.removeItem('AcceptedRequest');
        
        Alert.alert('Success', 'Repair marked as completed!', [
          { text: 'OK', onPress: () => navigation.navigate('MasterHomeScreen') }
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to complete repair.');
      }
    } catch (error) {
      console.error("Complete repair error:", error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to complete repair. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContactPress = () => {
    let phone = request?.user?.phone;
    if (phone) {
      if (phone.startsWith('91') && phone.length > 10) {
        phone = phone.slice(2);
      }
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleSupportPress = () => {
    // Add support functionality here
    Alert.alert('Support', 'Contact support at: support@example.com');
  };

  const handleCancelPress = () => {
    Alert.alert(
      'Cancel Repair', 
      'Are you sure you want to cancel this repair?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading request details...</Text>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16 }}>
            No request details available.
          </Text>
          <TouchableOpacity 
            style={[styles.actionBtn, { marginTop: 20, backgroundColor: '#007bff' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.actionText, { color: '#fff' }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Overlay Modal Content */}
      {isModalVisible && (
        <View style={styles.bottomContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>Complete Repair</Text>
              <Text style={styles.repairId}>ID: {request.requestId}</Text>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.repairHeader}>
                <Ionicons name="radio-button-on" size={16} color="#007bff" />
                <Text style={styles.repairPoint}>Repair Point</Text>
              </View>
              <Text style={styles.address}>
                {request.location?.address || 'Unknown Address'}
              </Text>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Service Requested</Text>
                  <Text style={styles.value}>{request.serviceType || 'Unknown Service'}</Text>
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Customer Name</Text>
                  <Text style={styles.value}>{request.user?.name?.trim() || '---'}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Vehicle Number</Text>
                  <Text style={styles.value}>{request.user?.vehicleNumber || '---'}</Text>
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Vehicle Model</Text>
                  <Text style={styles.value}>{request.user?.vehicleModel || '---'}</Text>
                </View>
              </View>

              {/* Repair Status */}
              <View style={styles.statusContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                <Text style={styles.statusText}>Ready to Complete</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={handleContactPress}
                disabled={loading}
              >
                <Text style={styles.actionText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={handleSupportPress}
                disabled={loading}
              >
                <Text style={styles.actionText}>Support</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: '#f8d7da' }]}
                onPress={handleCancelPress}
                disabled={loading}
              >
                <Text style={[styles.actionText, { color: '#b00020' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Slide to Confirm Button */}
            <View style={styles.slideContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#b00020" />
                  <Text style={styles.loadingText}>Completing repair...</Text>
                </View>
              ) : (
                <SlideToConfirm
                  onSlideComplete={handleCompleteRepair}
                  text="Complete Repair"
                  sliderColor="#fff"
                  trackColor="#28a745"
                  textColor="#fff"
                  direction="right"
                  disabled={loading}
                />
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   bottomContent: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingTop: 20,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   etaContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   etaLabel: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   repairId: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   infoCard: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//   },
//   repairHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   repairPoint: {
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   address: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   halfWidth: {
//     flex: 0.48,
//   },
//   label: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   value: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#e9ecef',
//   },
//   statusText: {
//     marginLeft: 8,
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#28a745',
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   actionBtn: {
//     backgroundColor: '#e9ecef',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     flex: 0.3,
//     alignItems: 'center',
//   },
//   actionText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },
//   slideContainer: {
//     marginTop: 20,
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//   },
//   loadingText: {
//     marginLeft: 10,
//     fontSize: 16,
//     color: '#666',
//   },
// });

export default MasterRepairCompleted;

// ...existing code...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    top: height * 0.40,
    left: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: SIZES.borderRadius + 5,
    borderTopRightRadius: SIZES.borderRadius + 5,
  },
  scrollContent: {
    paddingBottom: SIZES.padding + 10,
  },
  etaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding - 5,
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: FONTS.medium,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
  },
  repairId: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.regular,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius + 2,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.margin / 2,
  },
  repairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  repairPoint: {
    marginLeft: 6,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
    color: COLORS.textDark,
  },
  directions: {
    marginLeft: 'auto',
    color: COLORS.primary,
    fontSize: FONTS.small,
    fontFamily: FONT_FAMILY.bold,
  },
  address: {
    fontSize: FONTS.small,
    color: COLORS.text,
    marginBottom: 15,
    fontFamily: FONT_FAMILY.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfWidth: {
    flex: 0.48,
  },
  label: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 2,
  },
  value: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusText: {
    marginLeft: 8,
    fontSize: FONTS.small,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.toggleActive,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginHorizontal: SIZES.padding,
  },
  actionBtn: {
    backgroundColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: SIZES.borderRadius - 5,
    flex: 0.3,
    alignItems: 'center',
  },
  actionText: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    fontSize: FONTS.medium,
  },
  slideContainer: {
    marginLeft: "11.25%",
    marginBottom: SIZES.margin,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: FONTS.medium,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.regular,
  },
});
// ...existing
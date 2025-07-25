import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import SlideToConfirm from '../../components/reuableComponents/slidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../../constants/constants";

const { width, height } = Dimensions.get('window');
const BASE_URL = `${API}`; // Replace with your actual base URL

const MasterStartRepair = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(true);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      const stored = await AsyncStorage.getItem('AcceptedRequest');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRequest(parsed);
        console.log("Fetched request:", parsed);
      }
      setLoading(false);
    };
    fetchRequest();
  }, []);

  const handleContactPress = () => {
    let phone = request?.user?.phone;
    if (phone) {
      if (phone.startsWith('91') && phone.length > 10) {
        phone = phone.slice(2);
      }
      Linking.openURL(`tel:${phone}`);
    }
  };

  // No OTP logic here

  const handleStartRepair = async () => {
    if (!request) {
      console.log("Request object is null or undefined");
      Alert.alert('Error', 'Request details not found.');
      return;
    }

    if (!request?.requestId) {
      console.log("Request ID missing in request object:", request);
      Alert.alert('Error', 'Request ID not found.');
      return;
    }

    try {
      setLoading(true);
      console.log(`Sending PATCH to: ${BASE_URL}/request/${request.requestId}/start-repair`);
      const response = await axios.patch(
        `${BASE_URL}/request/${request.requestId}/start-repair`
      );
      console.log("API Response:", response.data);

      if (response.status === 200 && response.data.status) {
        Alert.alert('Success', 'Repair started successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('MasterRepairCompleted') }
        ]);
      } else {
        console.log("API did not return success:", response.data);
        Alert.alert('Error', response.data.message || 'Please try again.');
      }
    } catch (error) {
      console.log("Error during start repair:", error, error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to start repair.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading request details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Overlay Modal Content */}
      {isModalVisible && (
        <View style={styles.bottomContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* ETA Info */}
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>Repair Details</Text>
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
                <View>
                  <Text style={styles.label}>Service Requested</Text>
                  <Text style={styles.value}>{request.serviceType || 'Unknown Service'}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Customer Name</Text>
                  <Text style={styles.value}>{request.user?.name?.trim() || '---'}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>Vehicle Number</Text>
                  <Text style={styles.value}>{request.user?.vehicleNumber || '---'}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Vehicle Model</Text>
                  <Text style={styles.value}>{request.user?.vehicleModel || '---'}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleContactPress}>
                <Text style={styles.actionText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f8d7da' }]}>
                <Text style={[styles.actionText, { color: '#b00020' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Slide to Confirm Button */}
            <View style={styles.slideContainer}>
              <SlideToConfirm
                onSlideComplete={handleStartRepair}
                text="Start Repair"
                sliderColor="#fff"
                trackColor="#006241"
                textColor="#fff"
                direction="right"
                disabled={loading}
              />
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MasterStartRepair;

// ...styles remain unchanged...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    top: height * 0.45, // Modal starts from 45% height
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
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
  },
  etaBox: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: SIZES.borderRadius - 3,
  },
  etaTime: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
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
  label: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.bold,
  },
  value: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
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
});
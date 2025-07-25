import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import SlideToConfirm from '../../components/reuableComponents/slidebar';
import axios from 'axios';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../../constants/constants";

const { width } = Dimensions.get('window');
const BASE_URL = `${API}`; // Ensure API is defined in constants

const MasterGettingRequest = ({ request, onDismiss, navigation }) => {
  // Extract the actual request object if wrapped in a key
  const actualRequest =
    request &&
    typeof request === "object" &&
    !Array.isArray(request) &&
    Object.keys(request).length === 1
      ? Object.values(request)[0]
      : request;

  const [timer, setTimer] = useState(60);
  const [actionLoading, setActionLoading] = useState(false);
  const isMounted = useRef(true);
  const soundRef = useRef(null);

  useEffect(() => {
  isMounted.current = true;

  return () => {
    isMounted.current = false; // cleanup flag
  };
}, []);

  useEffect(() => {
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/alert.mp3'),
        { isLooping: true }
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  };

  playSound();

  const interval = setInterval(() => {
    setTimer(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        stopSound();   // stop sound after timeout
        onDismiss?.();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  // Cleanup when component unmounts
  return () => {
    clearInterval(interval);
    stopSound();     // stop sound if component unmounts early
  };
}, []);


const stopSound = async () => {
  if (soundRef.current) {
    try {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    } catch (e) {
      console.warn('Failed to stop or unload sound:', e);
    }
    soundRef.current = null;
  }
};

  const handleAccept = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    await stopSound();

    try {
      const userData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(userData);
      const masterId = parsedData?._id;
      if (!masterId || !actualRequest?.requestId) {
        Alert.alert('Error', 'Master ID or Request ID is missing.');
        return;
      }

      const response = await axios.patch(
        `${BASE_URL}/request/${actualRequest.requestId}/assign`,
        { masterId }
      );

      if (response.status === 200) {
        if (!isMounted.current) return;

        await AsyncStorage.setItem('AcceptedRequest', JSON.stringify(actualRequest));
        Alert.alert('Success', 'Request has been successfully assigned.');
        onDismiss?.();
        setTimeout(() => {
          navigation.navigate('MasterRequestAccepted');
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to assign the request.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while assigning the request.');
    } finally {
      if (isMounted.current) setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    await stopSound();

    try {
      const userData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(userData);
      const masterId = parsedData?._id;

      if (!masterId || !actualRequest?.requestId) {
        Alert.alert('Error', 'Master ID or Request ID is missing.');
        return;
      }

      const response = await axios.patch(
        `${BASE_URL}/request/${actualRequest.requestId}/cancelled-master`,
        { masterId }
      );

      if (response.status === 200) {
        if (!isMounted.current) return;
        Alert.alert('Success', 'Request has been successfully rejected.');
        onDismiss?.();
      } else {
        Alert.alert('Error', 'Failed to reject the request.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while rejecting the request.');
    } finally {
      if (isMounted.current) setActionLoading(false);
    }
  };

  if (!actualRequest) {
    Alert.alert('Error', 'No request details available.');
    onDismiss?.();
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.modalContainer}>
        <View style={styles.card}>
          <Text style={styles.timer}>
            Grab Your Booking Within <Text style={styles.timerCircle}>{timer}s</Text>
          </Text>

          <View style={styles.section}>
            <Text style={styles.label}>Repair Point</Text>
            <Text style={styles.title}>{actualRequest.location?.address || 'Unknown Location'}</Text>
            <Text style={styles.link}>{`${actualRequest.distanceKm} KM` || 'Unknown Distance'} | Directions</Text>
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Service Requested</Text>
              <Text style={styles.value}>{actualRequest.serviceType || 'Unknown Service'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Customer Name</Text>
              <Text style={styles.value}>{actualRequest.user?.name?.trim() || 'Unknown Name'}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Vehicle Number</Text>
              <Text style={styles.value}>{actualRequest.user?.vehicleNumber || 'Unknown Number'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Vehicle Model</Text>
              <Text style={styles.value}>{actualRequest.user?.vehicleModel || 'Unknown Model'}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Vehicle Brand</Text>
              <Text style={styles.value}>{actualRequest.user?.vehicleBrand || 'Unknown Brand'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Fuel Type</Text>
              <Text style={styles.value}>{actualRequest.user?.vehicleFuel || 'Unknown Fuel'}</Text>
            </View>
          </View>

          <View>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.value}>₹ {actualRequest.amount || '0.00'}</Text>
          </View>

          <View style={styles.sliderContainer}>
            <SlideToConfirm
              onSlideComplete={handleAccept}
              text="Accept Repair"
              sliderColor="#fff"
              trackColor="#006241"
              textColor="#fff"
              direction="right"
            />
            <SlideToConfirm
              onSlideComplete={handleReject}
              text="Ignore Repair"
              sliderColor="#fff"
              trackColor="#b00020"
              textColor="#fff"
              direction="left"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// ...existing code...
const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    height: 520,
    width: width - 40,
    marginHorizontal: 10,
    alignSelf: 'center',
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: 'space-between',
  },
  timer: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
    marginBottom: 10,
    color: COLORS.primary,
    textAlign: "center",
  },
  timerCircle: {
    color: COLORS.primary,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
    marginVertical: 2,
    color: COLORS.textDark,
  },
  link: {
    color: COLORS.primary,
    fontSize: FONTS.small,
    marginVertical: 2,
    fontFamily: FONT_FAMILY.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: FONTS.small,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
  },
  value: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  sliderContainer: {
    marginTop: 0,
    gap: 8,
  },
});
// ...existing code...

export default MasterGettingRequest;
// ✅ MasterGettingRequest.js (with top-right countdown, red animation in last 5 seconds)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  NativeModules
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import SlideToConfirm from '../../components/reuableComponents/slidebar';
import axios from 'axios';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../../constants/constants";
import { useRequest } from '../../contexts/RequestContext';
const { SoundControl } = NativeModules;

const { width } = Dimensions.get('window');
const BASE_URL = `${API}`;

const MasterGettingRequest = ({ navigation }) => {
  const { incomingRequest: request, hideRequest, countdown } = useRequest();
  const [fadeAnim] = useState(new Animated.Value(1));

const actualRequest = request || {};

  useEffect(() => {
    if (countdown <= 5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [countdown]);

  const handleAccept = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(userData);
      const masterId = parsedData?._id;
      SoundControl.stopSound();
      if (!masterId || !actualRequest?.requestId) {
        Alert.alert('Error', 'Master ID or Request ID is missing.');
        return;
      }
      
       
      const response = await axios.patch(
        `${BASE_URL}/request/${actualRequest?.requestId}/assign`,
        { masterId }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('AcceptedRequest', JSON.stringify(actualRequest));
        Alert.alert('Success', 'Request has been successfully assigned.');
        hideRequest?.();
        setTimeout(() => {
          navigation.navigate('MasterRequestAccepted');
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to assign the request.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while assigning the request.');
    }
  };

  const handleReject = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(userData);
      const masterId = parsedData?._id;
      SoundControl.stopSound();
      if (!masterId || !actualRequest?.requestId) {
        Alert.alert('Error', 'Master ID or Request ID is missing.');
        return;
      }
      
      const response = await axios.patch(
        `${BASE_URL}/request/${actualRequest?.requestId}/cancelled-master`,
        { masterId }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Request has been successfully rejected.');
        hideRequest?.();
      } else {
        Alert.alert('Error', 'Failed to reject the request.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while rejecting the request.');
    }
  };

  if (!actualRequest) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />

      <View style={styles.container}>
        {/* Header + Countdown */}
          <View style={styles.topHeader}>
            <Text style={styles.headerText}>Grab Your Booking Within</Text>
            <View style={styles.countdownCircle}>
              <Animated.Text
                style={[
                  styles.countdownText,
                  countdown <= 5 && { color: '#FF3B30' },
                  { opacity: countdown <= 5 ? fadeAnim : 1 },
                ]}
              >
                {countdown}
              </Animated.Text>
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardTitle}>
              <Text style={styles.sectionTitle}>🔘 Repair Point</Text>
              <Text style={styles.linkText}>Directions</Text>
            </View>
            
            <Text style={styles.boldText}>Dwarka Nagar</Text>
            <Text style={styles.descriptionText}>
              {actualRequest?.location?.address}
            </Text>
            <Text style={styles.directionText}>
              {actualRequest?.distanceKm} KM 
            </Text>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Service Requested</Text>
                <Text style={styles.value}>{actualRequest?.serviceType}</Text>
              </View>
              <View>
                <Text style={styles.label}>Customer Name</Text>
                <Text style={styles.value}>{actualRequest?.userName}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Vehicle Number</Text>
                <Text style={styles.value}>{actualRequest?.userVehicleNumber}</Text>
              </View>
              <View>
                <Text style={styles.label}>Vehicle Model</Text>
                <Text style={styles.value}>{actualRequest?.userVehicleModel}</Text>
              </View>
            </View>
          </View>

          {/* Slide Actions */}
          <View style={styles.buttonRow}>
          <SlideToConfirm
            onSlideComplete={handleAccept}
            text="Accept Repair"
            sliderColor="#fff"
            trackColor="#007A4D"
            textColor="#fff"
            direction="right"
          />
          <SlideToConfirm
            onSlideComplete={handleReject}
            text="Ignore Repair"
            sliderColor="#fff"
            trackColor="#B00020"
            textColor="#fff"
            direction="left"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  cardTitle: {
   flexDirection:'row',
   gap: "50%"
  },
  topHeader: {
    backgroundColor: '#F9F9FB',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {

    fontSize: 18,
    fontWeight: '700',
    color: '#44A9FF',
  },
  countdownCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 5,
    borderColor: '#44A9FF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F4FF',
  },
  countdownText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0080FF',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginBottom: 6,
  },
  boldText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    marginVertical: 4,
  },
  directionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  buttonRow: {
    alignItems:"center",
   
    
  },
});

export default MasterGettingRequest;
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import SlideToConfirm from '../../components/reuableComponents/slidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import axios from 'axios';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.156.44.93:3000/api'; // Replace with your actual base URL

const MasterVerifyOtp = ({navigation}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(180);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputs = useRef([]);
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const otpRef = useRef(otp);

  useEffect(() => {
    otpRef.current = otp;
    const complete = otp.every(digit => digit.length === 1);
    setIsOtpComplete(complete);
  }, [otp]);

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
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleOTPChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, '');
    setOtp(newOtp);
    console.log("OTP after change:", newOtp);

    if (text && index < otp.length - 1 && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  useEffect(() => {
    const complete = otp.every(digit => digit.length === 1);
    setIsOtpComplete(complete);
  }, [otp]);

  useEffect(() => {
    if (otp.every(d => d.length === 1)) {
      console.log("Auto-verifying because OTP is complete:", otp.join(''));
      // Optionally auto-trigger verification or highlight slide bar
    }
  }, [otp]);

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0 && inputs.current[index - 1]) {
      inputs.current[index - 1].focus();
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSlideComplete = () => {
    Keyboard.dismiss();

    setTimeout(() => {
      const latestOtp = otpRef.current.join('');
      console.log("Final OTP at slide complete:", latestOtp);

      // if (latestOtp.length !== 4 || latestOtp.includes('')) {
      //   Alert.alert("Invalid OTP", "Please complete entering the 4-digit OTP.");
      //   return;
      // }

      handleVerifyOtp(latestOtp);  // Pass OTP directly
    }, 200);
  };

  const handleVerifyOtp = async (enteredOtp) => {
    console.log("Start Repair Triggered");
    console.log("Joined OTP:", enteredOtp);

    if (enteredOtp.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit OTP.');
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/request/${request.requestId}/verify-otp`,
        { otp: enteredOtp }
      );
      console.log("API Response:", response.data);

      if (response.status === 200 && response.data.status) {
        Alert.alert('Success', 'OTP verified successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('MasterStartRepair') }
        ]);
      } else {
        Alert.alert('Invalids OTP', response.data.message || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to verify OTP.');
    }
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
    <View style={styles.container}>
      
      {/* Modal Card Content */}
       <View style={styles.modal}>
        <View style={styles.row}>
          <Text style={styles.title}>Verify your Customer within</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
        </View>

        <Text style={styles.repairId}>
          Repair ID: {request?.requestId || '---'}
        </Text>
        <Text style={styles.customerName}>
          Customer Name: <Text style={{ fontWeight: 'bold' }}>{request?.user?.name?.trim() || '---'}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleOTPChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit}
              returnKeyType="next"
            />
          ))}
        </View>

        <Text style={styles.helperText}>Please ask customer for OTP</Text>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
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
            onSlideComplete={handleSlideComplete}
            text="Verify OTP"
            sliderColor="#fff"
            trackColor="#006241"
            textColor="#fff"
            direction="right"
            disabled={!isOtpComplete || isVerifying}
          />
        </View>
      </View>
    </View>
  );
};

export default MasterVerifyOtp;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timerBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  timerText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  repairId: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  customerName: {
    fontSize: 14,
    marginBottom: 15,
    color: '#333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    textAlign: 'center',
    fontSize: 18,
  },
  helperText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#e2e6ea',
    borderRadius: 10,
  },
  actionText: {
    fontWeight: 'bold',
    color: '#333',
  },
  primaryBtn: {
    backgroundColor: '#007b55',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  slideContainer: {
    marginLeft: "6.25%",
    marginBottom: 20,
  },
});

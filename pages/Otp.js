import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../constants/constants";
import { getFCMToken, requestFCMPermission } from '../components/firebaseSetup';



export default function OTPScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpInputs = useRef([]);
  const BASE_URL = `${API}`; 
  const formattedPhone = phone.replace("+", "");
  const [loading, setLoading] = useState(false);
  // Fetch phone number from AsyncStorage
  useEffect(() => {
    const getPhone = async () => {
      const storedPhone = await AsyncStorage.getItem('enteredPhoneNumber');
      if (storedPhone) setPhone(storedPhone);
    };
    getPhone();
  }, []);

  useEffect(() => {
  const setupFCM = async () => {
    await requestFCMPermission(); // 👈 First ask for permission
  };

  setupFCM();
}, []);

  const handleVerifyOTP = async () => {
    if (otp.join("").length === 4) {
      try {
        console.log("verify the opt");
        setLoading(true);
        const response = await axios.post(`${BASE_URL}/login`, { phone: formattedPhone });
        

        if (response.data.message === "User found") {
          const user = response.data.user;

          await AsyncStorage.setItem('userData', JSON.stringify(user));
          console.log("User data saved to AsyncStorage:", user);

            // ✅ Send FCM token to backend
            const token = await getFCMToken();
            if (token) {
              await axios.post(`${BASE_URL}/notification/save-fcm-token`, {
                userId: user._id,
                fcmToken: token,
              });
            }

          // Navigate based on user role
          if (user.role === "user") {
            if (user.VehicleDetails && user.VehicleDetails.length > 0) {
              navigation.navigate("UserHome", { userId: user._id, user });
            } else {
              navigation.navigate("VehicleDetails", { userId: user._id, user });
            }
          } else if (user.role === "master") {
            if (user._id) {
              navigation.navigate("MasterHomeScreen", { userId: user._id, user });
            } else {
              navigation.navigate("masterDetails", { userId: user._id, user });
            }
          } else {
            alert("Unknown role. Please contact support.");
          }
        } 
        else{
          alert("Error, please try again.");
        }
      } catch (error) {
        if(error.response && error.response.data.message == "User not found") {
          // if no user found, naviate to role selection
          // alert(error.response.data.message + ". Please select your role.");
          Alert.alert(
            "👋 Welcome!",
            "It looks like you're new here.\nPlease register and choose your role to get started. 📝",
            [{ text: "Got it", style: "default" }]
          );
          navigation.replace("roleSelection", { phone: formattedPhone });
        } else {
          console.error("Login Error:", error.response || error.message);
          alert("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      alert("Invalid OTP, please try again.");
    }
  };

  const handleOTPChange = (text, index) => {
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move focus to next input if a digit is entered
    if (text && index < otpInputs.current.length - 1) {
      otpInputs.current[index + 1].focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login or Signup</Text>
      <View style={styles.formContainer}>
        <View className="DetailsSection">
          <Text style={styles.subtitle}>Verify Phone Number</Text>
          <Text style={styles.subtitletext}>
            Please enter the 4 digit code sent to{"\n"}
            {phone} through SMS
          </Text>
        </View>

        {/* "Edit your phone number?" Link */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.editPhoneText}>Edit your phone number ?</Text>
        </TouchableOpacity>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={(input) => (otpInputs.current[index] = input)}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="number-pad"
              value={value}
              onChangeText={(text) => handleOTPChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
                  otpInputs.current[index - 1].focus();
                }
              }}
            />
          ))}
        </View>

        <Text style={styles.resendText}>
          Haven't received the code? <Text style={styles.resendLink}>Resend</Text>
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={loading}>
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>

        {loading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={{ color: "#007BFF", marginTop: 8, textAlign: "center" }}>Verifying...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.background,
    marginTop: SIZES.margin,
  },
  formContainer: {
    marginTop: 40,
    flex: 1,
    gap: 10,
  },
  title: {
    fontSize: FONTS.large,
    fontFamily: FONT_FAMILY.bold,
    textAlign: "center",
    marginBottom: 10,
    color: COLORS.textDark,
  },
  subtitle: {
    textAlign: "left",
    color: COLORS.textDark,
    fontSize: FONTS.extraLarge,
    marginBottom: 5,
    fontFamily: FONT_FAMILY.bold,
  },
  subtitletext: {
    color: COLORS.text,
    marginBottom: 30,
    fontFamily: FONT_FAMILY.regular,
  },
  editPhoneText: {
    textAlign: "left",
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  otpInput: {
    width: 70,
    height: 70,
    textAlign: "center",
    fontSize: FONTS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    marginHorizontal: 5,
    backgroundColor: COLORS.secondary,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textDark,
  },
  resendText: {
    textAlign: "center",
    marginBottom: 20,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONTS.medium,
  },
  resendLink: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.secondary,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: "bold",
  },
});

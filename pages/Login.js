import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../constants/constants";


export default function LoginScreen() {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleGetOTP = async () => {
    if (phoneNumber.length >= 10) {
      // Store the phone number in AsyncStorage
      try {
        await AsyncStorage.setItem('enteredPhoneNumber', phoneNumber);
      } catch (e) {
        console.log("Failed to save phone number:", e);
      }
      navigation.navigate("OTP");
    } else {
      alert("Enter a valid phone number!");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login / Signup</Text>

      <View style={styles.formContainer}>
        <View style={styles.DetailsSection}>
        <Text style={styles.subtitle}>Enter Phone number for verification</Text>
        <Text style={styles.subtitletext}>We’ll text a code to verify your phone number</Text>
        </View>

        {/* Phone Number Input */}
        <PhoneInput
            defaultValue={phoneNumber}
            defaultCode="IN"
            layout="first"
            onChangeFormattedText={(text) => setPhoneNumber(text)}
            containerStyle={styles.phoneContainer}
            textContainerStyle={styles.phoneInput} // Fix visibility
            textInputStyle={styles.phoneText} // Ensure text is visible
            />

        <Text style={styles.note}>
        Note: By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from Wecrews and its affiliates to the number provided.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGetOTP}>
          <Text style={styles.buttonText}>Get OTP</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONTS.large,
    textAlign: "center",
    marginTop: SIZES.margin,
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.bold,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    marginTop: 40,
    gap: 10,
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: COLORS.secondary,
    fontFamily: FONT_FAMILY.regular,
  },
  phoneContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.secondary,
    marginBottom: 10,
    overflow: "hidden",
    width: "100%",
  },
  phoneInput: {
    height: 50,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.secondary,
    paddingVertical: 0,
    alignItems: "center",
  },
  phoneText: {
    fontSize: FONTS.medium,
    color: COLORS.textDark,
    padding: 0,
    fontFamily: FONT_FAMILY.regular,
  },
  note: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    textAlign: "left",
    marginBottom: 20,
    fontFamily: FONT_FAMILY.regular,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.secondary,
    fontSize: FONTS.medium,
    fontWeight: "bold",
    fontFamily: FONT_FAMILY.bold,
  },
  signupNote: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 20,
    fontFamily: FONT_FAMILY.regular,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontFamily: FONT_FAMILY.bold,
  },
});
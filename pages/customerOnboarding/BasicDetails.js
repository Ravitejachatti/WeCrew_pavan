import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../../constants/constants";
import LoadingBars from "../../components/reuableComponents/loadingBars";
import { useAuth } from "../../contexts/AuthContext";
import { getFCMToken } from "../../components/firebaseSetup";

const sanitizePhone = (input) =>
  input?.startsWith("+91") ? input.replace("+91", "91") : input;

const LabeledInput = ({ label, value, onChangeText, placeholder, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  </View>
);

export default function BasicDetails() {
  const { login } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedRole } = route.params;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobDate, setDobDate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPhone = async () => {
      let paramPhone = route.params?.phone;
      if (paramPhone) {
        setPhone(sanitizePhone(paramPhone));
      } else {
        const storedPhone = await AsyncStorage.getItem('enteredPhoneNumber');
        if (storedPhone) setPhone(sanitizePhone(storedPhone));
      }
    };
    getPhone();
  }, [route.params?.phone]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDobDate(selectedDate);
      setDob(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !dob.trim() || !gender.trim()) {
      Alert.alert("Missing Fields", "Please fill in all the fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!/^\d{12}$/.test(phone)) {
      Alert.alert("Invalid Phone", "Phone number must be 12 digits.");
      return;
    }

    // Getting fcmToken for user
    const fcmToken = await getFCMToken()


    try {
      setLoading(true);
      const userData = {
        name,
        phone,
        email,
        dob: new Date(dob),
        gender,
        fcmToken
      };
      console.log("checking ", userData)
      const response = await axios.post(`${API}/user`, userData);
      if (response.status === 200 || response.status === 201) {

        const responseData = response.data.user;
        await AsyncStorage.setItem("CustomerData", JSON.stringify(responseData));
        if (selectedRole === "user") {
          navigation.navigate("VehicleDetails", { responseData });
        }
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error.response?.data?.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to Register. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const GENDER_OPTIONS = ["Male", "Female", "Other"];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={styles.flexContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>Register</Text>
              <View style={styles.formContainer}>
                <Text style={styles.subtitle}>Enter Your Details {"\n"}for your Profile</Text>
                <Text style={styles.subtitletext}>Enter Your Details correctly for Profile</Text>

                <LabeledInput label="Name" placeholder="Enter Name" value={name} onChangeText={setName} />
                <LabeledInput label="Email" placeholder="Enter Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <LabeledInput label="Mobile Number" value={phone} editable={false} keyboardType="number-pad" />

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.radioContainer}>
                    {GENDER_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioButton}
                        onPress={() => setGender(option)}
                      >
                        <View style={styles.radioOuterCircle}>
                          {gender === option && <View style={styles.radioInnerCircle} />}
                        </View>
                        <Text style={styles.radioLabel}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: dob ? 'black' : '#888' }}>{dob || 'Select Date of Birth'}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dobDate || new Date(2000, 0, 1)}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      onChange={handleDateChange}
                    />
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Text style={styles.note}>
                Note: Your data is safe and securely protected with us, ensuring privacy and confidentiality.
              </Text>
              <TouchableOpacity
                style={[styles.button, loading && { backgroundColor: "#ccc" }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <LoadingBars color={COLORS.primary} size={36} />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flexContainer: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
  },
  title: {
    fontSize: FONTS.large,
    textAlign: "center",
    marginTop: SIZES.margin,
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.bold,
  },
  formContainer: {
    marginTop: 40,
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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: FONTS.small,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 15,
    backgroundColor: COLORS.secondary,
    fontSize: FONTS.medium,
    justifyContent: "center",
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textDark,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
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
    fontFamily: FONT_FAMILY.bold,
    fontWeight: "bold",
  },
  loginNote: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 20,
    fontFamily: FONT_FAMILY.regular,
  },
  loginLink: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: "bold",
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuterCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: FONTS.small,
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.regular,
  },  
});

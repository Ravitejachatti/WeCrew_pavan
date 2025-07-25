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
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";
import { API } from "../../constants/constants"; // Import API constant

export default function BasicDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { selectedRole } = route.params;
  const [phone, setPhone] = useState(""); // Use state for phone
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobDate, setDobDate] = useState(null);
  const [loading, setLoading] = useState(false);

    // Fetch phone from params or AsyncStorage
  useEffect(() => {
    const getPhone = async () => {
      let paramPhone = route.params?.phone;
      if (paramPhone) {
        // Remove "+" before 91 if present
        if (paramPhone.startsWith("+91")) {
          paramPhone = paramPhone.replace("+91", "91");
        }
        setPhone(paramPhone);
      } else {
        const storedPhone = await AsyncStorage.getItem('enteredPhoneNumber');
        if (storedPhone) {
          let formatted = storedPhone;
          if (formatted.startsWith("+91")) {
            formatted = formatted.replace("+91", "91");
          }
          setPhone(formatted);
        }
      }
    };
    getPhone();
  }, [route.params?.phone]);

  const handleDateChange = (event, selectedDate) => {
  setShowDatePicker(Platform.OS === 'ios'); // keep open on iOS
  if (selectedDate) {
    setDobDate(selectedDate);
    const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    setDob(formattedDate);
  }
};
  
  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !dob.trim() || !gender.trim()) {
      Alert.alert("Missing Fields", "Please fill in all the fields.");
      return;
    }
  
    // if (selectedRole === "Master" && (!bloodGroup.trim() || !emergencyContactNumber.trim())) {
    //   Alert.alert("Missing Fields", "Please fill in Blood Group and Emergency Contact.");
    //   return;
    // }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
  
    if (!/^\d{12}$/.test(phone)) {
      Alert.alert("Invalid Phone", "Phone number must be 10 digits.");
      return;
    }
  
    try {
      setLoading(true); // ✅ Start loading

      const userData = {
        name,
        phone,
        email,
        dob: new Date(dob),
        gender,
        // ...(selectedRole === "Master" && {
        //   bloodGroup,
        //   emergencyContactNumber,
        // }),
      };
  
      console.log(userData);
      const url =   `${API}/user`;
        // selectedRole === "Master"
        //   ? "https://192.168.20.93:3000/api/master"
        //   : 
        
  
      const response = await axios.post(url, userData);
  
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data.user;
        console.log("responseData",responseData)
      
        // Save response data to AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(responseData));
        await AsyncStorage.setItem('userRole', selectedRole);
      
        // Navigate based on user role
        if (selectedRole === "Customer") {
          navigation.navigate("VehicleDetails");
        } 
        // else {
        //   navigation.navigate("VehicleDetails");
        // }
      }
       else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error.response?.data?.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to Register. Please try again later."
      );
    } finally {
      setLoading(false); // ✅ End loading
    }
  };
  
  
  

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

                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Name"
                    value={name}
                    onChangeText={setName}
                    keyboardType='default'
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>

                {/* Mobile No Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Mobile number"
                    value={phone}
                    keyboardType="number-pad"
                    editable = {false} // Disable editing for phone number
                  />
                </View>
                
                {/* Gender Input */}
                <View style={styles.inputContainer}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.radioContainer}>
                    {["Male", "Female", "Other"].map((option) => (
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

                {/* Date of Birth Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: dob ? 'black' : '#888' }}>
                      {dob || 'Select Date of Birth'}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={dobDate || new Date(2000, 0, 1)} // default DOB
                      mode="date"
                      display="default"
                      maximumDate={new Date()} // prevent future dates
                      onChange={handleDateChange}
                    />
                  )}
                </View>

                
                {/* {selectedRole === "Master" && ( */}
                  <>
                    {/* Blood Group */}
                    {/* <View style={styles.inputContainer}>
                      <Text style={styles.label}>Blood Group</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., O+, A-, B+"
                        value={bloodGroup}
                        onChangeText={setBloodGroup}
                      />
                    </View> */}

                    {/* Emergency Contact */}
                    {/* <View style={styles.inputContainer}>
                      <Text style={styles.label}>Emergency Contact Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter emergency contact number"
                        value={emergencyContactNumber}
                        onChangeText={setEmergencyContactNumber}
                        keyboardType="numeric"
                      />
                    </View> */}
                  </>
                {/* )} */}
              </View>
            </ScrollView>



            {/* Footer - Fixed Bottom Button */}
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
                  <ActivityIndicator color="#fff" />
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

import React, { useState } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // For the checkmark icon
// import { Picker } from '@react-native-picker/picker'; // Import Picker
import DropDownPicker from 'react-native-dropdown-picker';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

export default function BasicDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [vehicleNo, setVehicleNo] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("Bike");
  const [selectVehicleType, setSelectedVehicleType] = useState("Petrol");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Petrol', value: 'Petrol' },
    { label: 'Diesel', value: 'Diesel' },
    { label: 'EV', value: 'EV' },
  ]);

  // const { email, dob, gender } = route.params; // Receiving data from the first screen

  const handleNext = () => {
    navigation.navigate("VehicleBrand", { vehicleNo, selectedVehicle, selectVehicleType });
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
              <Text style={styles.title}>Vehicle Details</Text>

              <View style={styles.formContainer}>
                <Text style={styles.subtitle}>Enter Your Vehicle{"\n"}Details for Your Profile</Text>
                <Text style={styles.subtitletext}>Enter Your Details correctly for Profile</Text>

                {/* Vehicle Number Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Vehicle Registration Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Vehicle No"
                    value={vehicleNo}
                    onChangeText={setVehicleNo}
                  />
                </View>

                {/* Vehicle Type Selection */}
                <View style={styles.container}>
                  <Text style={styles.label}>Vehicle Type</Text>

                  <View style={styles.buttonContainer}>
                    {/* Bike Selection */}
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedVehicle === "Bike" && styles.selectedOption,
                      ]}
                      onPress={() => setSelectedVehicle("Bike")}
                    >
                      <Text style={[styles.optionText, selectedVehicle === "Bike" && styles.selectedText]}>
                        Bike
                      </Text>
                      {selectedVehicle === "Bike" && (
                        <Ionicons name="checkmark-circle" size={22} color="#007BFF" />
                      )}
                    </TouchableOpacity>

                    {/* Car Selection */}
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedVehicle === "Car" && styles.selectedOption,
                      ]}
                      onPress={() => setSelectedVehicle("Car")}
                    >
                      <Text style={[styles.optionText, selectedVehicle === "Car" && styles.selectedText]}>
                        Car
                      </Text>
                      {selectedVehicle === "Car" && (
                        <Ionicons name="checkmark-circle" size={22} color="#007BFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Fuel Type Dropdown */}
                <View style={{ zIndex: 1000 }}>
                    <DropDownPicker
                      open={open}
                      value={value}
                      items={items}
                      setOpen={setOpen}
                      setValue={setValue}
                      setItems={setItems}
                      style={[
                        styles.dropdown,
                        value && styles.dropdownSelected // Apply this style only if value is selected
                      ]}
                      dropDownContainerStyle={styles.dropdownContainer}
                      placeholder="Select Type"
                      listMode="SCROLLVIEW" // <- helps avoid VirtualizedList issues
                      textStyle={styles.textStyle}
                      placeholderStyle={styles.placeholderStyle}
                    />
                  </View>
              </View>
            </ScrollView>


          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
                  {/* Footer - Fixed Bottom Button */}
                  <View style={styles.footer}>
              <Text style={styles.note}>
                Note: Your data is safe and securely protected with us, ensuring privacy and confidentiality.
              </Text>

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
    </SafeAreaView>
  );
}

// ...existing code...
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
    color: COLORS.text,
    marginBottom: 5,
    fontFamily: FONT_FAMILY.bold,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 15,
    backgroundColor: COLORS.secondary,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textDark,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.secondary,
    width: "45%",
    marginBottom: 15,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: "#EAF2FF", // You can add a new color in constants if needed
  },
  optionText: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.regular,
  },
  selectedText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
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
    marginBottom: 10,
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
  pickerContainer:  {
    zIndex: 1000,
    marginTop: 20,
  },
  dropdown: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    height: 50,
    backgroundColor: COLORS.secondary,
  },
  dropdownSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#e6f0ff", // You can add a new color in constants if needed
  },
  dropdownContainer: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
  },
  textStyle: {
    fontSize: FONTS.medium,
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.regular,
  },
  placeholderStyle: {
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.regular,
  },
});
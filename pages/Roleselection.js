import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RoleSelectionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { phone } = route.params || {}; // Get phone number from params if available
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelection = async (role) => {
    setSelectedRole(role);
    await AsyncStorage.setItem("userRole", role); // ✅ Correct value
  };

  const handleNext = () => {
    if (selectedRole === "user") {
      navigation.navigate("BasicDetails", { selectedRole, phone });
    } else if (selectedRole === "Master") {
      navigation.navigate("masterDetails", { selectedRole, phone });
    } else {
      alert("Please select a role to continue.");
      return;
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>
      <Text style={styles.subtitle}>Are you a Customer or a Master?</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, selectedRole === "user" && styles.selectedRole]}
          onPress={() => handleRoleSelection("user")}
        >
          <Text style={styles.roleText}>Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, selectedRole === "Master" && styles.selectedRole]}
          onPress={() => handleRoleSelection("Master")}
        >
          <Text style={styles.roleText}>Master</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONTS.extraLarge,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    marginBottom: 30,
    fontFamily: FONT_FAMILY.regular,
    textAlign: "center",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  roleButton: {
    flex: 1,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
    marginHorizontal: 10,
  },
  selectedRole: {
    backgroundColor: COLORS.primary,
  },
  roleText: {
    fontSize: FONTS.large,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.secondary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  nextButtonText: {
    color: COLORS.secondary,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
  },
});

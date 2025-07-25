import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MasterBottomNavigator from "../../components/MasterBottomNavigator";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const MasterProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditMasterProfile')}
        >
          <Ionicons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user?.name || "User"}</Text>
        <Text style={styles.profileEmail}>{user?.email || ""}</Text>
        <Text style={styles.profilePhone}>
          {user?.phone ? `+${user.phone}` : ""}
        </Text>
        {/* <Text style={styles.profileUserCode}>
          {user?.userCode ? `User Code: ${user.userCode}` : ""}
        </Text> */}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <FontAwesome5 name={item.icon} size={18} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
        {/* Logout Option */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#e74c3c" style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: "#e74c3c" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      <MasterBottomNavigator />
    </View>
  );
};

const menuItems = [
  { title: "My Earnings", icon: "rupee-sign", screen: "MasterEarnings" },
  { title: "My Repair History", icon: "book", screen: "MasterRepairHistory" },
  { title: "My Payment Methods", icon: "credit-card", screen: "MasterPaymentMethods" },
  { title: "Terms & Conditions", icon: "file-alt", screen: "MasterTermsAndConditions" },
  { title: "Help & Support", icon: "headset", screen: "MasterHelpAndSupport" },
  { title: "About Us", icon: "info-circle", screen: "MasterAboutUs" },
];

// ...existing code...
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    paddingHorizontal: SIZES.padding, 
    paddingTop: SIZES.margin + 10 
  },
  profileContainer: { 
    alignItems: "center", 
    marginBottom: SIZES.margin 
  },
  editProfileButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 20,
  },
  profileImage: { 
    width: SIZES.avatarSize * 2, 
    height: SIZES.avatarSize * 2, 
    borderRadius: SIZES.avatarSize 
  },
  profileName: { 
    fontSize: FONTS.large, 
    fontFamily: FONT_FAMILY.bold, 
    marginTop: 10, 
    color: COLORS.textDark 
  },
  profileEmail: { 
    fontSize: FONTS.small, 
    color: COLORS.text, 
    fontFamily: FONT_FAMILY.regular 
  },
  profilePhone: { 
    fontSize: FONTS.small, 
    color: COLORS.text, 
    marginTop: 2, 
    fontFamily: FONT_FAMILY.regular 
  },
  profileUserCode: { 
    fontSize: FONTS.small, 
    color: COLORS.textLight, 
    marginTop: 2, 
    fontFamily: FONT_FAMILY.regular 
  },
  menuContainer: { 
    backgroundColor: COLORS.secondary, 
    borderRadius: SIZES.borderRadius, 
    paddingVertical: 5 
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: { 
    marginRight: 15 
  },
  menuText: { 
    flex: 1, 
    fontSize: FONTS.medium, 
    color: COLORS.textDark, 
    fontFamily: FONT_FAMILY.bold 
  },
});

export default MasterProfileScreen;
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MasterBottomNavigator from "../../components/MasterBottomNavigator";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";
import { use } from "react";
import LoadingBars from "../../components/reuableComponents/loadingBars";



const MasterProfileScreen = ({ navigation }) => {
  // const { user, logout, loading } = useAuth();
  // get user data from async storage
  const {logout, authLoading} = useAuth();
  const [user, setUser] = useState(null); 
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
      console.log('Fetched user data:', storedUserData);
    };
    fetchUserData();
  }, []);
const [loading, setLoading] = useState(false);

const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout, // 🟢 No navigation.reset
      },
    ],
    { cancelable: true }
  );
};


  if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <LoadingBars color={COLORS.primary} size={36} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

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
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout} disabled={authLoading}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#e74c3c" style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: "#e74c3c" }]}>{authLoading ? 'logging out': 'logout'}</Text>
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
    backgroundColor: '#F5F7FA',
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
  marginTop: 10,
  gap: 12, // gap between cards
},

menuItem: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  // elevation: 2,
},
menuIcon: {
  marginRight: 14,
  width: 24,
  textAlign: "center",
},

menuText: {
  flex: 1,
  fontSize: FONTS.medium,
  color: COLORS.textDark,
  fontFamily: FONT_FAMILY.bold,
},

loadingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: '#F5F7FA',
},
loadingText: {
  fontSize: 16,
  fontFamily: FONT_FAMILY.regular,
  color: COLORS.text,
},
});

export default MasterProfileScreen;
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserBottomNavigator from "../../components/UserBottomNavigator";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";


const UserProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  // user details from the async storage
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    };
    fetchUserData();
  }, []);

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
          onPress={() => navigation.navigate('EditUserProfile')}
        >
          <Ionicons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userData?.name || '' }</Text>
        <Text style={styles.profileEmail}>{userData?.email || ''}</Text>
        <Text style={styles.profilePhone}>
          {userData?.phone ? `+${userData?.phone}` : `+${userData?.user?.phone}` || ''}
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
      <UserBottomNavigator />
    </View>
  );
};

const menuItems = [
  { title: "My Vehicle", icon: "car", screen: "UserVehicles" },
  { title: "My Bookings", icon: "book", screen: "UserBookings" },
  { title: "Terms & Conditions", icon: "file-alt", screen: "UserTermsAndConditions" },
  { title: "Help & Support", icon: "headset", screen: "UserHelpAndSupport" },
  { title: "About Us", icon: "info-circle", screen: "UserAboutUs" },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 20, paddingTop: 50 },
  profileContainer: { alignItems: "center", marginBottom: 20 },
  editProfileButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 20,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  profileName: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
  profileEmail: { fontSize: 14, color: "#777" },
  profilePhone: { fontSize: 14, color: "#777", marginTop: 2 },
  profileUserCode: { fontSize: 13, color: "#888", marginTop: 2 },
  menuContainer: { backgroundColor: "#fff", borderRadius: 10, paddingVertical: 5 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  menuIcon: { marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, color: "#333" },
});

export default UserProfileScreen;
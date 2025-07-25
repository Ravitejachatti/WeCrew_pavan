import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import UserBottomNavigator from "../../../components/UserBottomNavigator";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const UserAboutUs = () => (
  <View style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/854/854878.png" }}
          style={styles.logo}
        />
      </View>
      <Text style={styles.header}>About WeCrew</Text>
      <Text style={styles.text}>
        WeCrew is your trusted partner for on-demand vehicle repair and roadside assistance. Our mission is to connect users with skilled service providers quickly and efficiently, ensuring you get back on the road with minimal hassle.
      </Text>
      <Text style={styles.sectionTitle}>Our Vision</Text>
      <Text style={styles.text}>
        To revolutionize the vehicle service industry by providing reliable, transparent, and accessible repair solutions for everyone, everywhere.
      </Text>
      <Text style={styles.sectionTitle}>Why Choose WeCrew?</Text>
      <Text style={styles.text}>
        • Fast and easy service requests{'\n'}
        • Verified and skilled professionals{'\n'}
        • Transparent pricing and secure payments{'\n'}
        • 24/7 customer support
      </Text>
      <Text style={styles.sectionTitle}>Contact Us</Text>
      <Text style={styles.text}>
        Have questions or need help? Reach out to our support team at:{'\n'}
        <Text style={styles.email}>support@wecrew.com</Text>
      </Text>
      <Text style={styles.footer}>
        © {new Date().getFullYear()} WeCrew. All rights reserved.
      </Text>
    </ScrollView>
    <UserBottomNavigator />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 18,
    marginTop: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  email: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});

export default  UserAboutUs;
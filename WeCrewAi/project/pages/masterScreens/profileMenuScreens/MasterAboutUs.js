import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import UserBottomNavigator from "../../../components/UserBottomNavigator";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const MasterAboutUs = () => (
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
export default  MasterAboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding - 2,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.margin - 2,
    marginTop: 10,
  },
  logo: {
    width: SIZES.avatarSize * 2,
    height: SIZES.avatarSize * 2,
    borderRadius: SIZES.borderRadius + 5,
  },
  header: {
    fontSize: FONTS.extraLarge,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    marginBottom: SIZES.margin - 2,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    marginTop: SIZES.margin - 4,
    marginBottom: 4,
  },
  text: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: FONT_FAMILY.regular,
  },
  email: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
  },
  footer: {
    marginTop: 30,
    fontSize: FONTS.small,
    color: COLORS.textLight,
    textAlign: "center",
    fontFamily: FONT_FAMILY.regular,
  },
});

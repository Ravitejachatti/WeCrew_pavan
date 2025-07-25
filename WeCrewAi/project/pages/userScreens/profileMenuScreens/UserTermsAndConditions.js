import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import UserBottomNavigator from "../../../components/UserBottomNavigator";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const UserTermsAndConditions = () => (
  <View style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Terms and Conditions</Text>

      <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
      <Text style={styles.text}>
        By using the WeCrew app, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.
      </Text>

      <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
      <Text style={styles.text}>
        You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
      </Text>

      <Text style={styles.sectionTitle}>3. Service Requests</Text>
      <Text style={styles.text}>
        All repair and assistance requests made through the app are subject to availability. WeCrew does not guarantee the immediate assignment of a service provider.
      </Text>

      <Text style={styles.sectionTitle}>4. Payments</Text>
      <Text style={styles.text}>
        All payments for services must be made through the payment options provided in the app. Prices are subject to change without notice.
      </Text>

      <Text style={styles.sectionTitle}>5. Cancellations and Refunds</Text>
      <Text style={styles.text}>
        Cancellation and refund policies are subject to the terms displayed at the time of booking. Please review them carefully before confirming your request.
      </Text>

      <Text style={styles.sectionTitle}>6. User Conduct</Text>
      <Text style={styles.text}>
        You agree not to misuse the app, including but not limited to providing false information, harassing service providers, or attempting to disrupt the app’s functionality.
      </Text>

      <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
      <Text style={styles.text}>
        WeCrew is not liable for any damages or losses resulting from the use of the app or services provided by third parties.
      </Text>

      <Text style={styles.sectionTitle}>8. Privacy</Text>
      <Text style={styles.text}>
        Your privacy is important to us. Please review our Privacy Policy to understand how your information is collected and used.
      </Text>

      <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
      <Text style={styles.text}>
        WeCrew reserves the right to update these Terms and Conditions at any time. Continued use of the app constitutes acceptance of the updated terms.
      </Text>

      <Text style={styles.sectionTitle}>10. Contact Us</Text>
      <Text style={styles.text}>
        For any questions or concerns regarding these Terms and Conditions, please contact our support team through the app.
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
    marginBottom: 70, // To avoid overlap with bottom navigator
    // paddingBottom: 20,
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
    marginBottom: 20,
    lineHeight: 30,
    paddingBottom: 20, // Add some padding to the bottom of each text block
  },
});

export default UserTermsAndConditions;
import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import UserBottomNavigator from "../../../components/UserBottomNavigator";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const UserHelpAndSupport = () => {
  const handleEmail = () => {
    Linking.openURL("mailto:support@wecrew.com?subject=Help%20and%20Support%20Request");
  };

  const handleCall = () => {
    Linking.openURL("tel:1800123456");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Help & Support</Text>
        <Text style={styles.text}>
          If you are facing any issues or need assistance, we are here to help you. Please use any of the options below to reach out to our support team.
        </Text>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.text}>
          • How do I request a repair or roadside assistance?{"\n"}
          Open the app, select your vehicle, choose the service, and submit your request.
        </Text>
        <Text style={styles.text}>
          • How can I track my request?{"\n"}
          You can track your request status in the 'My Requests' section of the app.
        </Text>
        <Text style={styles.text}>
          • What if I need to cancel my request?{"\n"}
          Go to 'My Requests', select your request, and choose the cancel option if available.
        </Text>

        <Text style={styles.sectionTitle}>Contact Support</Text>
        <TouchableOpacity style={styles.button} onPress={handleEmail}>
          <Text style={styles.buttonText}>Email Us: support@wecrew.com</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCall}>
          <Text style={styles.buttonText}>Call Us: 1800-123-456</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Live Chat</Text>
        <Text style={styles.text}>
          For instant support, use the live chat feature available in the app during working hours.
        </Text>

        <Text style={styles.footer}>
          WeCrew Support Team is available 24/7 to assist you.
        </Text>
      </ScrollView>
      <UserBottomNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
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
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  footer: {
    marginTop: 30,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});

export default UserHelpAndSupport;
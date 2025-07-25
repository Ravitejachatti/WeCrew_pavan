import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const MasterTermsAndConditions = () => (
  <ScrollView style={styles.container}>
    <Text style={styles.header}>Terms and Conditions</Text>

    <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
    <Text style={styles.text}>
      By registering as a Master on the WeCrew app, you agree to comply with these Terms and Conditions. If you do not agree, please do not use the app as a service provider.
    </Text>

    <Text style={styles.sectionTitle}>2. Eligibility</Text>
    <Text style={styles.text}>
      You must provide accurate and up-to-date information regarding your identity, qualifications, and service capabilities. WeCrew reserves the right to verify your details at any time.
    </Text>

    <Text style={styles.sectionTitle}>3. Service Commitments</Text>
    <Text style={styles.text}>
      As a Master, you agree to respond promptly to service requests, arrive at the customer’s location on time, and perform services professionally and ethically.
    </Text>

    <Text style={styles.sectionTitle}>4. Payments and Fees</Text>
    <Text style={styles.text}>
      Payments for completed services will be processed through the WeCrew platform. Any applicable fees or commissions will be deducted as per the agreement.
    </Text>

    <Text style={styles.sectionTitle}>5. Cancellations</Text>
    <Text style={styles.text}>
      If you are unable to fulfill a confirmed request, you must notify the customer and WeCrew support as soon as possible. Frequent cancellations may result in suspension.
    </Text>

    <Text style={styles.sectionTitle}>6. Code of Conduct</Text>
    <Text style={styles.text}>
      Masters must treat all customers with respect, avoid any form of harassment or discrimination, and maintain a professional demeanor at all times.
    </Text>

    <Text style={styles.sectionTitle}>7. Liability</Text>
    <Text style={styles.text}>
      You are responsible for the quality and safety of the services you provide. WeCrew is not liable for any damages or disputes arising from your actions.
    </Text>

    <Text style={styles.sectionTitle}>8. Data Privacy</Text>
    <Text style={styles.text}>
      You must protect the privacy of customer information and use it only for the purpose of fulfilling service requests.
    </Text>

    <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
    <Text style={styles.text}>
      WeCrew reserves the right to update these Terms and Conditions at any time. Continued use of the app as a Master constitutes acceptance of the updated terms.
    </Text>

    <Text style={styles.sectionTitle}>10. Contact Us</Text>
    <Text style={styles.text}>
      For any questions or concerns regarding these Terms and Conditions, please contact WeCrew support through the app.
    </Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding - 2,
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
    marginBottom: 20,
    lineHeight: 26,
    paddingBottom: 20,
    fontFamily: FONT_FAMILY.regular,
  },
});


export default MasterTermsAndConditions;
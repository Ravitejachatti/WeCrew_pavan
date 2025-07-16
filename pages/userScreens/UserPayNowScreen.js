import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const UserPayNowScreen = ({ route, navigation }) => {
  const amount = route?.params?.amount || "596.00";

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.header}>Payment</Text>

      {/* Price Summary */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>Price Summary</Text>
        <Text style={styles.amount}>₹ {amount}</Text>
      </View>

      {/* Payment Options */}
      <Text style={styles.sectionTitle}>Payment Options</Text>
      <View style={styles.offersContainer}>
        <TouchableOpacity style={styles.offerButton}>
          <FontAwesome5 name="gift" size={16} color="black" />
          <Text style={styles.offerText}>UPTO ₹200 Cashback...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.offerButton}>
          <MaterialIcons name="arrow-forward" size={16} color="black" />
          <Text style={styles.offerText}>View all available offers</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Methods */}
      <Text style={styles.sectionTitle}>All Payment Options</Text>
      <Text style={styles.subTitle}>UPI Payment</Text>
      <View style={styles.paymentRow}>
        <TouchableOpacity style={styles.paymentOption}><Text>🟣 PhonePe</Text></TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption}><Text>⚪ Paytm</Text></TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption}><Text>🔵 G Pay</Text></TouchableOpacity>
      </View>

      {/* Total & Pay Button */}
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalAmount}>₹ {amount}</Text>
        <TouchableOpacity style={styles.payButton} onPress={() => navigation.navigate("RequestAcceptedScreen")}>
  <Text style={styles.payText}>Pay & Request</Text>
</TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
  backButton: { position: "absolute", top: 15, left: 15, zIndex: 10 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginVertical: 15 },
  priceContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 },
  priceText: { fontSize: 16, color: "#666" },
  amount: { fontSize: 20, fontWeight: "bold", marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  offersContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  offerButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#EEE", padding: 10, borderRadius: 8 },
  offerText: { marginLeft: 5, fontSize: 14 },
  subTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  paymentRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  paymentOption: { padding: 10, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 20 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderTopWidth: 1, borderColor: "#ddd" },
  totalText: { fontSize: 18, fontWeight: "bold" },
  totalAmount: { fontSize: 18, fontWeight: "bold" },
  payButton: { backgroundColor: "#007BFF", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  payText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});

export default UserPayNowScreen;

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const BASE_URL = "https://192.168.20.93:3000/api"; // Replace with your actual base URL

const UserBookings = () => {
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const userStr = await AsyncStorage.getItem("userData");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          const id = userObj._id || userObj.userId;
          setUserId(id);

          const response = await axios.get(`${BASE_URL}/user/${id}/analytics`);
          if (response.data && Array.isArray(response.data.data.completedRequests)) {
            setBookings(response.data.data.completedRequests);
          } else {
            setBookings([]);
          }
        }
      } catch (e) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.serviceType}>{item.serviceType || "---"}</Text>
        <Text style={styles.amount}>{item.amount ? `₹${item.amount}` : "---"}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.infoRow}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/189/189792.png" }}
          style={styles.vehicleIcon}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.vehicleText}>{item.vehicleName || "---"}</Text>
          <Text style={styles.vehicleNumber}>{item.vehicleNumber || "---"}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.dateLabel}>
          {item.date ? new Date(item.date).toLocaleString() : "---"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ color: "#007BFF", marginTop: 10 }}>Loading your bookings...</Text>
      </View>
    );
  }

  if (!bookings.length) {
    return (
      <View style={styles.centered}>
        <Image
          source={{ uri: "https://assets10.lottiefiles.com/packages/lf20_jtbfg2nb.json" }}
          style={{ width: 180, height: 180, marginBottom: 20 }}
        />
        <Text style={{ fontSize: 18, color: "#888", fontWeight: "bold" }}>No Requests until now</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={renderBooking}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#007BFF",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D7552",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 10,
    borderRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vehicleIcon: {
    width: 36,
    height: 36,
    marginRight: 12,
    tintColor: "#007BFF",
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  vehicleNumber: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: "#E6F4EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  statusText: {
    color: "#0D7552",
    fontWeight: "bold",
    fontSize: 13,
  },
  dateLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
    fontStyle: "italic",
  },
  label: { fontSize: 15, color: "#888", marginBottom: 2 },
  value: { color: "#222", fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
});

export default UserBookings;
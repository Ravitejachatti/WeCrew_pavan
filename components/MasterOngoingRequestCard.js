import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LoadingBars from "./reuableComponents/loadingBars";

const MasterOngoingRequestCard = () => {
  const navigation = useNavigation();
  const [requestData, setRequestData] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOngoingRequest = async () => {
      try {
        const stored = await AsyncStorage.getItem("AcceptedRequest");
        if (!stored) return;

        const parsed = JSON.parse(stored);
        const requestId = parsed?.requestId;
        if (!requestId) return;

        const db = getDatabase();
        const snapshot = await get(ref(db, `ongoingMasters/${requestId}`));
        const ongoing = snapshot.val();

        if (snapshot.exists()) {
          setRequestData(ongoing);
          setStatus(ongoing.status);
        }
      } catch (err) {
        console.error("Error fetching ongoing request:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingRequest();
  }, []);

  const navigateBasedOnStatus = () => {
    switch (status) {
      case "assigned":
        navigation.navigate("MasterRequestAccepted");
        break;
      case "otp_verified":
        navigation.navigate("MasterVerifyOtp");
        break;
      case "repair_started":
        navigation.navigate("MasterStartRepair");
        break;
      case "repair_completed":
        navigation.navigate("MasterRepairCompleted");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <LoadingBars color={COLORS.primary} size={36} />
        <Text style={styles.text}>Checking ongoing request...</Text>
      </View>
    );
  }

  if (!requestData) return null;

  const user = requestData.user || {};
  const vehicle = `${user.vehicleBrand || ""} ${user.vehicleModel || ""}`;
  const location = requestData.location?.address || "N/A";

  return (
    <TouchableOpacity style={styles.card} onPress={navigateBasedOnStatus}>
      <Text style={styles.title}>Ongoing Repair</Text>
      <Text style={styles.text}>👤 {user.name}</Text>
      <Text style={styles.text}>📞 {user.phone}</Text>
      <Text style={styles.text}>🚘 {vehicle}</Text>
      <Text style={styles.text}>📍 {location}</Text>
      <Text style={styles.status}>🛠 Status: {status}</Text>
      <Text style={styles.tap}>👉 Tap to continue</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#e6f5e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#34a853",
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#ff9900",
  },
  tap: {
    marginTop: 6,
    fontStyle: "italic",
    color: "#666",
  },
});

export default MasterOngoingRequestCard;
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Linking } from "react-native";
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserBottomNavigator from "../../components/UserBottomNavigator";
import { getDatabase, ref, get } from "firebase/database";
import axios from "axios";
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../../constants/constants";
import LoadingBars from "../../components/reuableComponents/loadingBars";

const UserRequestAcceptedScreen = ({ navigation }) => {
  const [request, setRequest] = useState(null);
  const [master, setMaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = `${API}`;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const reqStr = await AsyncStorage.getItem("UserRepairRequestResponse");
        const masterStr = await AsyncStorage.getItem("MasterAssignedToRequest");
        if (reqStr) {
          const reqObj = JSON.parse(reqStr);
          setRequest(reqObj.request || reqObj); // Use .request if present, else root
        }
        if (masterStr) {
          const masterObj = JSON.parse(masterStr);
          setMaster(masterObj.master || masterObj); // Use .master if present, else root
        }
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  // Check ongoingMasters for repairId
  useEffect(() => {
    if (!request?._id) return;
    const checkOngoingMaster = async () => { 
      try {
        const db = getDatabase();
        const snap = await get(ref(db, `ongoingMasters/${request._id}`));
        if (!snap.exists()) {
          navigation.replace("UserToMasterRatings");
        }
      } catch (e) {
        // handle error if needed
      }
    };
    checkOngoingMaster();
    // Optionally, poll every few seconds if you want to auto-redirect when master removes the request
    const interval = setInterval(checkOngoingMaster, 5000);
    return () => clearInterval(interval);
  }, [request?._id, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingBars color={COLORS.primary} size={36} />
      </View>
    );
  }

  // Fallbacks if data is missing
  const repairIdRaw = request?._id || "---";
  const repairId = repairIdRaw !== "---" && repairIdRaw.length > 4
    ? repairIdRaw.slice(-4)
    : repairIdRaw;
  const otp = request?.otp || "----";
  const serviceType = request?.serviceType || "---";
  const vehicleNumber = request?.vehicleNumber || "---";
  const pickupLocation = request?.location?.address || "---";
  const masterName = master?.name || "---";
  const masterPhone = master?.phone || "";
  const vehicleModel = request?.vehicleModel || "---";
  const amount = request?.amount ? `₹${request.amount}` : "---";
  const assignedAt = master?.assignedAt ? new Date(master.assignedAt).toLocaleString() : "---";
  
  const handleCancel = async () => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel the request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            const fullRequestId = request?._id;
            console.log(fullRequestId);
            if (fullRequestId) {
              try {
                await axios.patch(
                  `${BASE_URL}/request/${fullRequestId}/cancel-request`,
                  {
                    cancelledBy: "user",
                    reason: "i want to go so fast"
                  }
                );
                await AsyncStorage.removeItem('UserRepairRequestResponse');
                await AsyncStorage.removeItem('MasterAssignedToRequest');
                navigation.replace('UserHome'); // or any other screen
              } catch (e) {
                Alert.alert("Something went wrong", e?.message || "Please try again.");
              }
            }
          }
        }
      ],
      { cancelable: true }
    );
  };
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container2} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Success Indicator */}
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle" size={70} color="#007BFF" style={styles.successIcon} />
          <Text style={styles.successText}>
            Request <Text style={{ color: "#007BFF" }}>Accepted!</Text>
          </Text>
          <Text style={styles.subText}>
            Your Master will arrive at your location soon.
          </Text>
        </View>

        {/* Repair & OTP Section */}
        <View style={styles.rowContainer}>
          <View style={styles.box}>
            <Text style={styles.label}>Repair ID</Text>
            <Text style={styles.value}>{repairId}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Request OTP</Text>
            <Text style={[styles.value, { color: "#007BFF", letterSpacing: 8 }]}>{otp}</Text>
          </View>
        </View>

        {/* Master Details */}
        <View style={styles.box2}>
          <Text style={styles.boldText}>Master Details</Text>
          <View style={styles.rowContainer}>
          <View style={styles.masterRow}>
            <Ionicons name="person-circle-outline" size={40} color="#888" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.masterName}>{masterName}</Text>
              {/* <Text style={styles.experience}>Assigned At: {assignedAt}</Text> */}
              <Text style={styles.services}>{master?.location?.city || ""}</Text>
            </View>
          </View>
          <View style={styles.contactIcons}>
            <TouchableOpacity onPress={() => masterPhone && Linking.openURL(`tel:+${masterPhone}`)}>
              <Feather name="phone-call" size={25} color="#007BFF" />
            </TouchableOpacity>
            {/* <TouchableOpacity>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#007BFF" />
            </TouchableOpacity> */}
          </View>
          </View>
        </View>

        {/* Service & Vehicle Number */}
        <View style={styles.rowContainer}>
          <View style={styles.box}>
            <Text style={styles.label}>Service Requested</Text>
            <Text style={styles.value}>{serviceType}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>{amount}</Text>
          </View>
        </View>
        {/* <View style={styles.rowContainer}>
          <View style={styles.box}>
            <Text style={styles.label}>Vehicle Model</Text>
            <Text style={styles.value}>{vehicleModel}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>{amount}</Text>
          </View>
        </View> */}

        {/* Pickup Location */}
        <View style={styles.box2}>
          <Text style={styles.boldText}>Pickup Location</Text>
          <Text style={styles.locationDetails}>{pickupLocation}</Text>
        </View>

        {/* Action Buttons */}
        {/* <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.contactButton} onPress={() => masterPhone && Linking.openURL(`tel:+${masterPhone}`)}>
            <Text style={styles.buttonText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Alert.alert("Coming Soon", "Feature coming soon!")}
          >
            <Text style={styles.buttonText}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel()}>
            <Text style={styles.buttonTextCancel}>Cancel</Text>
          </TouchableOpacity>
        </View> */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => masterPhone && Linking.openURL(`tel:+${masterPhone}`)}>
            <Text style={[styles.buttonText, { color: "#007BFF" }]}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Feature coming soon!")}>
            <Text style={[styles.buttonText, { color: "#0D7552" }]}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCancel()}>
            <Text style={[styles.buttonTextCancel, { color: "#FF3B30" }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <UserBottomNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", alignItems: "center", padding: 10 },
  container2: { width: "100%" },
  centered: { alignItems: "center", marginTop: 30, marginBottom: 10 },
  successIcon: { marginBottom: 10 },
  successText: { fontSize: 24, fontWeight: "bold", marginTop: 5, color: "#222" },
  subText: { fontSize: 16, color: "#666", marginBottom: 20, textAlign: "center" },
  rowContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 10 },
  box: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    width: "48%",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  box2: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    width: "100%",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 14, color: "#888" },
  value: { fontSize: 18, fontWeight: "bold", marginTop: 5, color: "#222" },
  boldText: { fontSize: 17, fontWeight: "bold", marginBottom: 8, color: "#888" },
  masterRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  masterName: { fontSize: 16, fontWeight: "bold", color: "#222" },
  experience: { fontSize: 14, color: "#666" },
  services: { fontSize: 14, color: "#333" },
  contactIcons: { flexDirection: "row", marginRight: 20, gap: 18 },
  locationDetails: { fontSize: 15, color: "#444", marginTop: 5 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 25,
    width: "100%",
    marginBottom: 30,
    gap: 10,
  },
  contactButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 13,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  supportButton: {
    backgroundColor: "#0D7552",
    paddingVertical: 13,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 13,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  buttonTextCancel: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});

export default UserRequestAcceptedScreen;
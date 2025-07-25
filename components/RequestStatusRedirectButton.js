import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, get } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RequestStatusRedirectButton = () => {
  const navigation = useNavigation();
  const bounceValue = useRef(new Animated.Value(1)).current;
  const [shouldShowButton, setShouldShowButton] = useState(false);

  useEffect(() => {
    const checkRequestStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("UserRepairRequestResponse");
        console.log("UserRepairRequestResponse:", userData);
        if (!userData) return;

        const user = JSON.parse(userData);
        const requestId = user?.request?._id;
        console.log("Request ID:", requestId);
        if (!requestId) return;

        const db = getDatabase();
        const requestRef = ref(db, `ongoingMasters/${requestId}`);
        const snapshot = await get(requestRef);
        console.log("Request snapshot:", snapshot.val());

        if (snapshot.exists()) {
          const status = snapshot.val().status;
          console.log("Request status:", status);
          if (["assigned", "in_progress", "completed"].includes(status)) {
            setShouldShowButton(true);
          }
        }
      } catch (err) {
        console.error("Failed to check request status:", err);
      }
    };

    checkRequestStatus();
  }, []);

  useEffect(() => {
    if (!shouldShowButton) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shouldShowButton]);

  const handleNavigation = async () => {
    try {
      const userData = await AsyncStorage.getItem("UserRepairRequestResponse");
      if (!userData) return;

      const user = JSON.parse(userData);
      const requestId = user?.request?._id;
      if (!requestId) return;

      const db = getDatabase();
      const requestRef = ref(db, `ongoingMasters/${requestId}`);
      const snapshot = await get(requestRef);

      if (snapshot.exists()) {
        const status = snapshot.val().status;
        if (status === "assigned" || status === "in_progress") {
          navigation.navigate("UserRequestAcceptedScreen");
        } else if (status === "completed") {
          navigation.navigate("UserToMasterRatings");
        }
      }
    } catch (err) {
      console.error("Failed to fetch request status on button press:", err);
    }
  };

  if (!shouldShowButton) return null;

  return (
    <Animated.View
      style={[
        styles.floatingButton,
        { transform: [{ scale: bounceValue }] },
      ]}
    >
      <TouchableOpacity style={styles.innerButton} onPress={handleNavigation}>
        <Text style={styles.buttonText}>🔧 Track Request</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 115,
    right: '30%',
    zIndex: 999,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 5,
    backgroundColor: "#007AFF",
  },
  innerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default RequestStatusRedirectButton;
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, onValue } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MasterRequestStatusRedirectButton = () => {
  const navigation = useNavigation();
  const bounceValue = useRef(new Animated.Value(1)).current;
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [nextScreen, setNextScreen] = useState(null);
  const [label, setLabel] = useState("🔧 Continue");

  useEffect(() => {
    let unsubscribe = null;

    const listenForRequestStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem("AcceptedRequest");
        if (!stored) return;

        const parsed = JSON.parse(stored);
        const requestId = parsed?.requestId;
        if (!requestId) return;

        const db = getDatabase();
        const requestRef = ref(db, `ongoingMasters/${requestId}`);

        unsubscribe = onValue(requestRef, (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            setShouldShowButton(false);
            return;
          }

          const status = data.status;
          console.log("Live status update:", status);

          switch (status) {
            case "assigned":
              setNextScreen("MasterVerifyOtp");
              setLabel("🔧 Assigned Request");
              setShouldShowButton(true);
              break;
            case "otp_verified":
              setNextScreen("MasterStartRepair");
              setLabel("✅ OTP Verified");
              setShouldShowButton(true);
              break;
            case "in_progress":
              setNextScreen("MasterRepairCompleted");
              setLabel("🛠 Repair Started");
              setShouldShowButton(true);
              break;
            case "completed":
              setNextScreen("MasterRepairCompleted");
              setLabel("✔ Repair Completed");
              setShouldShowButton(true);
              break;
            default:
              setShouldShowButton(false);
          }
        });
      } catch (err) {
        console.error("Error in real-time status listener:", err);
      }
    };

    listenForRequestStatus();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe(); // Cleanup listener
      }
    };
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

  const handleNavigation = () => {
    if (nextScreen) {
      navigation.navigate(nextScreen);
    }
  };

  if (!shouldShowButton) return null;

  return (
    <Animated.View
      style={[styles.floatingButton, { transform: [{ scale: bounceValue }] }]}
    >
      <TouchableOpacity style={styles.innerButton} onPress={handleNavigation}>
        <Text style={styles.buttonText}>{label}</Text>
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
    backgroundColor: "#34a853",
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

export default MasterRequestStatusRedirectButton;
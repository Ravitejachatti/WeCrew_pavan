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

const MasterRequestStatusRedirectButton = ({ ongoingRequest }) => {
  const navigation = useNavigation();
  const bounceValue = useRef(new Animated.Value(1)).current;

  const [label, setLabel] = useState("🔧 Continue");
  const [nextScreen, setNextScreen] = useState(null);
  const [shouldShowButton, setShouldShowButton] = useState(false);

  useEffect(() => {
    if (ongoingRequest && ongoingRequest.status) {
      const status = ongoingRequest.status;
      switch (status) {
        case "assigned":
          setLabel("🔧 Verify otp");
          setNextScreen("MasterVerifyOtp");
          setShouldShowButton(true);
          break;
        case "otp_verified":
          setLabel("✅ Start Repair");
          setNextScreen("MasterStartRepair");
          setShouldShowButton(true);
          break;
        case "in_progress":
          setLabel("🛠 Complete Repair");
          setNextScreen("MasterRepairCompleted");
          setShouldShowButton(true);
          break;
        case "completed":
          setLabel("✔ Repair Completed");
          setNextScreen("MasterRepairCompleted");
          setShouldShowButton(true);
          break;
        default:
          setShouldShowButton(false);
      }
    } else {
      setShouldShowButton(false);
    }
  }, [ongoingRequest]);

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

  if (!shouldShowButton) return null;

  return (
    <Animated.View
      style={[styles.floatingButton, { transform: [{ scale: bounceValue }] }]}
    >
      <TouchableOpacity style={styles.innerButton} onPress={() => navigation.navigate(nextScreen)}>
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
floatingButton: {
  position: "absolute",
  bottom: 115,
  left: "30%",
  width: 180, // ✅ Fixed width
  transform: [{ translateX: -90 }], // ✅ Half of width
  zIndex: 999,
  borderRadius: 30,
  overflow: "hidden",
  elevation: 5,
  backgroundColor: "#34a853",
  alignItems: "center", // ✅ Center the content
},
innerButton: {
  paddingVertical: 12,
  width: '100%', // ✅ Take full space
  alignItems: "center",
},
buttonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
},
});

export default MasterRequestStatusRedirectButton;
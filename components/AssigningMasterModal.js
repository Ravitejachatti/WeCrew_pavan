import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// Add your firebase import here
import { getDatabase, ref, get, set, remove } from 'firebase/database';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from "../constants/constants";

const { width } = Dimensions.get('window');
const BASE_URL = `${API}`;

// Use online image URLs for gears and sad face
const GEAR_BLUE =
  { uri: 'https://cdn-icons-png.flaticon.com/512/189/189792.png' }; // blue gear icon
const GEAR_ORANGE =
  { uri: 'https://cdn-icons-png.flaticon.com/512/189/189792.png' }; // orange gear icon (will tint)
const SAD_FACE =
  { uri: 'https://cdn-icons-png.flaticon.com/512/742/742751.png' }; // sad face icon

const AssigningMasterModal = ({ visible, onClose, masterAssigned, onCancel, navigation }) => {
  const [timer, setTimer] = useState(0); // seconds
  const [stage, setStage] = useState(1); // 1, 2, 3
  const [showSad, setShowSad] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [requestId, setRequestId] = useState(null);

  // For spinning gears
  const spinAnimBlue = useRef(new Animated.Value(0)).current;
  const spinAnimOrange = useRef(new Animated.Value(0)).current;

  // For progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Fetch requestId from AsyncStorage on mount
  useEffect(() => {
    const fetchRequestId = async () => {
      const stored = await AsyncStorage.getItem('UserRepairRequestResponse');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRequestId(parsed.request._id);
        } catch (e) {
          setRequestId(null);
        }
      }
    };
    fetchRequestId();
  }, [visible]);

  useEffect(() => {
  if (!visible) {
    setTimer(0);
    setStage(1);
    setShowSad(false);
    setShowClose(false);
    progressAnim.setValue(0);
    return;
  }

  let interval;
  let totalSeconds = 0;

  // Animate gears
  Animated.loop(
    Animated.timing(spinAnimBlue, {
      toValue: 1,
      duration: 1200,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  Animated.loop(
    Animated.timing(spinAnimOrange, {
      toValue: 1,
      duration: 900,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  // Animate progress bar
  Animated.timing(progressAnim, {
    toValue: 1,
    duration: 5 * 60 * 1000, // 5 minutes
    useNativeDriver: false,
  }).start();

  // Main timer logic
  interval = setInterval(async () => {
    totalSeconds += 1;
    setTimer(totalSeconds);

    if (totalSeconds < 60) {
      setStage(1);
    } else if (totalSeconds < 180) {
      setStage(2);
    } else if (totalSeconds < 300) {
      setStage(3);
    } else {
      setShowSad(true);
      setShowClose(true);
      clearInterval(interval);

      // Remove request from masterRequests in Firebase and AsyncStorage
      if (requestId) {
        try {
          const db = getDatabase();
          const masterRequestsRef = ref(db, 'masterRequests');
          const snapshot = await get(masterRequestsRef);
          if (snapshot.exists()) {
            const masterRequests = snapshot.val();
            // Iterate over all masterIds
            for (const masterId in masterRequests) {
              if (
                masterRequests[masterId] &&
                masterRequests[masterId][requestId]
              ) {
                // Remove the requestId under this masterId
                await remove(ref(db, `masterRequests/${masterId}/${requestId}`));
              }
            }
          }
          //await AsyncStorage.removeItem('UserRepairRequestResponse');
                } catch (e) {
          // handle error if needed
        }
      }
    }
  }, 1000);

  return () => {
    clearInterval(interval);
    spinAnimBlue.stopAnimation();
    spinAnimOrange.stopAnimation();
    progressAnim.stopAnimation();
  };
}, [visible, requestId]);

  // Check for master assignment in firebase
  useEffect(() => {
  if (!requestId || !visible) return;
  const checkAssignment = async () => {
    try {
      const db = getDatabase();
      const snap = await get(ref(db, `ongoingMasters/${requestId}`));
      if (snap.exists()) {
        const masterAssignedData = snap.val();
        //await AsyncStorage.removeItem('UserRepairRequestResponse');
        await AsyncStorage.setItem('MasterAssignedToRequest', JSON.stringify(masterAssignedData));
        if (onClose) onClose();
        setTimeout(() => {
          navigation.navigate('UserRequestAcceptedScreen');
        }, 100); // Small delay to ensure modal closes first
      }
    } catch (e) {
      // handle error if needed
    }
  };
  const interval = setInterval(checkAssignment, 10000); // Poll every 2s
  return () => clearInterval(interval);
}, [requestId, visible]);

  // Cancel confirmation
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
            if (requestId) {
              try {
                await axios.patch(
                  `${BASE_URL}/request/${requestId}/cancel-request`,
                  {
                    cancelledBy: "user",
                    reason: "i want to go so fast"
                  }
                );
                // Remove from AsyncStorage
                //await AsyncStorage.removeItem('UserRepairRequestResponse');
              } catch (e) {
                // handle error if needed
              }
            }
            if (onCancel) onCancel();
            if (onClose) onClose();
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Close button handler after timeout
  const handleClose = async () => {
    if (onClose) onClose();
  };

  // Progress bar width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.7],
  });

  // Gear spins
  const spinBlue = spinAnimBlue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spinOrange = spinAnimOrange.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  // Text content based on stage
  let stageText = 'Searching for Master...';
  if (stage === 2) stageText = 'Still searching, please wait...';
  if (stage === 3) stageText = 'Trying harder to find a Master...';
  if (showSad) stageText = 'No Masters available at the moment.';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>

            {/* Gears or Sad Animation */}
            {!showSad ? (
              <View style={styles.gearsContainer}>
                <Animated.Image
                  source={GEAR_BLUE}
                  style={[styles.gear, { transform: [{ rotate: spinBlue }] }]}
                  resizeMode="contain"
                />
                <Animated.Image
                  source={GEAR_ORANGE}
                  style={[
                    styles.gear,
                    styles.gearOrange,
                    { transform: [{ rotate: spinOrange }], tintColor: '#FF9100' }
                  ]}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.sadContainer}>
                <Image source={SAD_FACE} style={styles.sadFace} resizeMode="contain" />
              </View>
            )}

            {/* Text */}
            <Text style={styles.text}>{stageText}</Text>

            {/* Cancel or Close Button */}
            {!showClose ? (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AssigningMasterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.8,
    elevation: 10,
  },
  progressBarContainer: {
    width: width * 0.7,
    height: 12,
    backgroundColor: '#22263a',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 30,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  gearsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  gear: {
    width: 60,
    height: 60,
  },
  gearOrange: {
    marginLeft: 20,
  },
  sadContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sadFace: {
    width: 70,
    height: 70,
  },
  text: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
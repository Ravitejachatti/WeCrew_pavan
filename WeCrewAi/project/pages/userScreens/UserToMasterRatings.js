import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const BASE_URL = 'http://10.156.44.93:3000/api'; // Replace with your actual base URL

const UserToMasterRatings = ({ navigation }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDone = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      // Get requestId from AsyncStorage
      const reqStr = await AsyncStorage.getItem('UserRepairRequestResponse');
      let requestId = null;
      if (reqStr) {
        const reqObj = JSON.parse(reqStr);
        requestId = reqObj.request?._id || reqObj._id;
      }
      if (!requestId) {
        Alert.alert("Error", "Request ID not found.");
        setSubmitting(false);
        return;
      }

      // Send rating to backend
      const response = await axios.post(
        `${BASE_URL}/request/${requestId}/rate`,
        {
          role: "user",
          rating,
          feedback: feedback.trim() || undefined,
        }
      );

      if (response.data && response.data.status) {
        await AsyncStorage.removeItem('UserRepairRequestResponse');
        await AsyncStorage.removeItem('MasterAssignedToRequest');
        navigation.navigate('UserHome');
      } else {
        Alert.alert("Error", response.data?.message || "Failed to submit rating.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Repair Complete</Text>

      {/* Confirmation Box */}
      <View style={styles.confirmBox}>
        <FontAwesome name="check-circle" size={48} color="#0D7552" />
        <Text style={styles.confirmText}>Repair Completed Successfully</Text>
      </View>

      {/* Inspiring Quote */}
      <View style={styles.quoteBox}>
        <AntDesign name="bulb1" size={18} color="#007BFF" />
        <Text style={styles.quoteText}>
          “We believe in service, not just earnings. Your feedback helps us grow together.”
        </Text>
      </View>

      {/* Rating Section */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>Rate Your Master</Text>
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((index) => (
            <TouchableOpacity key={index} onPress={() => setRating(index)}>
              <FontAwesome name="star" size={32} color={rating >= index ? "#FFD700" : "#D3D3D3"} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feedback Input */}
      <TextInput
        style={styles.feedbackInput}
        placeholder="Write your feedback (optional)"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={3}
        editable={!submitting}
      />

      {/* Done Button - Enabled only when rating is provided */}
      <TouchableOpacity
        style={[styles.doneButton, { backgroundColor: rating > 0 ? "#007BFF" : "#BEBEBE", marginTop: 30 }]}
        disabled={rating === 0 || submitting}
        onPress={handleDone}
      >
        <Text style={styles.doneButtonText}>{submitting ? "Submitting..." : "Done"}</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FC',
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: 'center'
  },
  header: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#222',
  },
  confirmBox: {
    backgroundColor: '#E6F4EA',
    width: '100%',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: "#0D7552",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmText: {
    color: '#0D7552',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  quoteBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F0FE',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  quoteText: {
    marginLeft: 10,
    color: '#007BFF',
    fontSize: 15,
    fontStyle: 'italic',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "#007BFF",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  starContainer: {
    flexDirection: 'row',
  },
  feedbackInput: {
    width: '100%',
    minHeight: 60,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    marginTop: 30,
    marginBottom: 10,
    color: '#222',
  },
  doneButton: {
    width: 120,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserToMasterRatings;
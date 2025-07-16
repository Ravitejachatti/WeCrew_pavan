import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../../constants/constants";

const STORAGE_KEY = "masterPaymentDetails";

const MasterPaymentMethods = () => {
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          setUpiId(parsed.upiId || "");
          setBankName(parsed.bankName || "");
          setQrImage(parsed.qrImage || null);
        }
      } catch (err) {
        // ignore
      }
    };
    loadData();
  }, []);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setQrImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!upiId || !bankName || !qrImage) {
      Alert.alert("Please fill all fields and upload QR code.");
      return;
    }
    const data = { upiId, bankName, qrImage };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setEditing(false);
    Alert.alert("Saved", "Payment details saved successfully.");
  };

  const handleEdit = () => setEditing(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Bank Payment Methods</Text>
      {(!editing && (upiId || bankName || qrImage)) ? (
        <View style={styles.card}>
          {qrImage && (
            <Image source={{ uri: qrImage }} style={styles.qrImage} />
          )}
          <Text style={styles.label}>Bank Name:</Text>
          <Text style={styles.value}>{bankName}</Text>
          <Text style={styles.label}>UPI ID:</Text>
          <Text style={styles.value}>{upiId}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {qrImage ? (
              <Image source={{ uri: qrImage }} style={styles.qrImage} />
            ) : (
              <Text style={styles.imagePickerText}>Upload Bank QR Code</Text>
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            value={bankName}
            onChangeText={setBankName}
          />
          <TextInput
            style={styles.input}
            placeholder="UPI ID"
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// ...existing code...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  header: {
    fontSize: FONTS.large,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: SIZES.margin - 2,
    textAlign: "center",
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    alignItems: "center",
    elevation: 2,
    marginTop: SIZES.margin,
  },
  qrImage: {
    width: SIZES.avatarSize * 4,
    height: SIZES.avatarSize * 4,
    borderRadius: SIZES.borderRadius - 3,
    marginBottom: SIZES.margin - 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    marginTop: 8,
    fontFamily: FONT_FAMILY.bold,
  },
  value: {
    fontSize: FONTS.medium,
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 6,
  },
  editButton: {
    marginTop: SIZES.margin - 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: SIZES.borderRadius - 7,
  },
  editButtonText: {
    color: COLORS.secondary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
  },
  form: {
    marginTop: SIZES.margin,
    alignItems: "center",
  },
  imagePicker: {
    width: SIZES.avatarSize * 4,
    height: SIZES.avatarSize * 4,
    borderRadius: SIZES.borderRadius - 3,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.margin - 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagePickerText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius - 7,
    padding: 12,
    marginBottom: 12,
    backgroundColor: COLORS.secondary,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textDark,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: SIZES.borderRadius - 7,
    marginTop: 10,
  },
  saveButtonText: {
    color: COLORS.secondary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.large,
  },
});

export default MasterPaymentMethods;
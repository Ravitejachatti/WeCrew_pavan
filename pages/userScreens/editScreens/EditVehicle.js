import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_FAMILY, FONTS, API } from '../../../constants/constants';

const BASE_URL = `${API}`;

const EditVehicle = ({ route, navigation }) => {
  const { vehicle } = route.params;
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: '',
    fuelType: '',
    brand: '',
    model: '',
    registrationNumber: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleType: vehicle.vehicleType || '',
        fuelType: vehicle.fuelType || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        registrationNumber: vehicle.registrationNumber || '',
      });
    }
  }, [vehicle]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.registrationNumber.trim()) {
      Alert.alert('Error', 'Registration number is required');
      return false;
    }
    if (!formData.brand.trim()) {
      Alert.alert('Error', 'Brand is required');
      return false;
    }
    if (!formData.model.trim()) {
      Alert.alert('Error', 'Model is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      
      const response = await axios.put(
        `${BASE_URL}/vehicle/${user._id}/vehicles/${vehicle._id}`,
        formData
      );

      if (response.status === 200) {
        // Update local storage
        const updatedVehicles = response.data.data;
        await AsyncStorage.setItem('UserVehicleDetails', JSON.stringify(updatedVehicles));
        
        Alert.alert('Success', 'Vehicle updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      
      const response = await axios.delete(
        `${BASE_URL}/vehicle/${user._id}/vehicles/${vehicle._id}`
      );

      if (response.status === 200) {
        // Update local storage
        const updatedVehicles = response.data.data;
        await AsyncStorage.setItem('UserVehicleDetails', JSON.stringify(updatedVehicles));
        
        Alert.alert('Success', 'Vehicle deleted successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Vehicle</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Registration Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.registrationNumber}
              onChangeText={(value) => handleInputChange('registrationNumber', value)}
              placeholder="Enter registration number"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.vehicleType}
                onValueChange={(value) => handleInputChange('vehicleType', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Vehicle Type" value="" />
                <Picker.Item label="Bike" value="Bike" />
                <Picker.Item label="Car" value="Car" />
                <Picker.Item label="Truck" value="Truck" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fuel Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.fuelType}
                onValueChange={(value) => handleInputChange('fuelType', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Fuel Type" value="" />
                <Picker.Item label="Petrol" value="Petrol" />
                <Picker.Item label="Diesel" value="Diesel" />
                <Picker.Item label="EV" value="EV" />
                <Picker.Item label="CNG" value="CNG" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              value={formData.brand}
              onChangeText={(value) => handleInputChange('brand', value)}
              placeholder="Enter brand"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Model *</Text>
            <TextInput
              style={styles.input}
              value={formData.model}
              onChangeText={(value) => handleInputChange('model', value)}
              placeholder="Enter model"
              placeholderTextColor={COLORS.textLight}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (loading || deleting) && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading || deleting}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.secondary} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {deleting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Deleting vehicle...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONTS.large,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  deleteButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  form: {
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textDark,
    backgroundColor: COLORS.secondary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.secondary,
  },
  picker: {
    color: COLORS.textDark,
    fontSize: FONTS.medium,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  saveButtonText: {
    color: COLORS.secondary,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.secondary,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.regular,
    marginTop: 10,
  },
});

export default EditVehicle;
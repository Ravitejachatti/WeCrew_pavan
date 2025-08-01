import React, { useState } from 'react';
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
import { SIZES, FONT_FAMILY, FONTS, API } from '../../../constants/constants';
import { useTheme } from '../../../contexts/ThemeContext';
import LoadingBars from '../../../components/reuableComponents/loadingBars';

const BASE_URL = `${API}`;

const AddVehicle = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: 'Bike',
    fuelType: 'Petrol',
    brand: '',
    model: '',
    registrationNumber: '',
  });

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
      
      const response = await axios.post(
        `${BASE_URL}/vehicle/${user._id}/vehicles`,
        formData
      );

      if (response.status === 200 || response.status === 201) {
        // Update local storage
        const updatedVehicles = response.data.data;
        await AsyncStorage.setItem('UserVehicleDetails', JSON.stringify(updatedVehicles));
        
        Alert.alert('Success', 'Vehicle added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>Add Vehicle</Text>
        <View style={styles.placeholder} />
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
              placeholderTextColor={colors.textLight}
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
              placeholder="Enter brand (e.g., Honda, Yamaha)"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Model *</Text>
            <TextInput
              style={styles.input}
              value={formData.model}
              onChangeText={(value) => handleInputChange('model', value)}
              placeholder="Enter model (e.g., Activa, R15)"
              placeholderTextColor={COLORS.textLight}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <LoadingBars color={colors.primary} size={36} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.secondary }]}>Add Vehicle</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONTS.large, 
    fontFamily: FONT_FAMILY.bold, 
  },
  placeholder: {
    width: 34,
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: SIZES.borderRadius, 
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: FONTS.medium, 
    fontFamily: FONT_FAMILY.regular, 
    backgroundColor: '#ffffff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: SIZES.borderRadius, 
    backgroundColor: '#ffffff',
  },
  picker: {
    fontSize: FONTS.medium, 
  },
  footer: {
    paddingHorizontal: SIZES.padding, 
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: SIZES.borderRadius, 
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#888',
  },
  saveButtonText: {
    fontSize: FONTS.medium, 
    fontFamily: FONT_FAMILY.bold, 
  },
});

export default AddVehicle;
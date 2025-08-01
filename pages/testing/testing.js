import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../constants/constants';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";


const REPAIRS = ['Towing', 'Battery Jumpstart', 'Puncture Repair', 'Mechanical', 'Electrical'];
const VEHICLES = ['Bike', 'Car', 'Auto', 'Truck', 'SUV', 'Scooter'];

const MasterOnboardingScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    aadharNumber: '',
    pancardNumber: '',
    emergencyContactNumber: '',
    shopAddress: { addressLine: '', state: '', pincode: '' },
    typeOfRepairs: [],
    vehicleTypesHandled: [],
  });

  const [focusedField, setFocusedField] = useState(null);
  const [masterPhoto, setMasterPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPhoneFromStorage = async () => {
      const storedPhone = await AsyncStorage.getItem('enteredPhoneNumber');
      if (storedPhone) {
        let formatted = storedPhone;
        if (formatted.startsWith('+91')) {
          formatted = formatted.replace('+91', '91');
        }
        setFormData(prev => ({ ...prev, phone: formatted }));
      }
    };
    fetchPhoneFromStorage();
  }, []);

  const RequiredLabel = ({ label }) => (
    <Text style={styles.label}>
      {label} <Text style={{ color: 'red' }}>*</Text>
    </Text>
  );

  const toggleSelect = (key, value) => {
    setFormData(prev => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value)
          ? list.filter(item => item !== value)
          : [...list, value],
      };
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      shopAddress: {
        ...prev.shopAddress,
        [field]: value,
      },
    }));
  };

  const pickMasterPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission required', 'Camera access is required.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setMasterPhoto(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.aadharNumber || !formData.pancardNumber || !formData.emergencyContactNumber || !formData.shopAddress.addressLine || !formData.shopAddress.state || !formData.shopAddress.pincode) {
      return Alert.alert('Missing Fields', 'Please fill all the required fields.');
    }

    // if (!masterPhoto) {
    //   return Alert.alert('Missing Photo', 'Please upload a master photo');
    // }

    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'shopAddress') {
          Object.entries(value).forEach(([k, v]) => data.append(`shopAddress[${k}]`, v));
        } else if (Array.isArray(value)) {
          value.forEach(v => data.append(`${key}[]`, v));
        } else {
          data.append(key, value);
        }
      });

      if (masterPhoto?.uri) {
        data.append('masterPhoto', {
          uri: masterPhoto.uri,
          type: 'image/jpeg',
          name: 'master.jpg',
        });
      }
      console.log(data)

      const response = await axios.post(`${API}/master`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = await response.json();
      if (response.ok) {
        console.log('masterData ', result.data);
        await AsyncStorage.setItem("userData", JSON.stringify(result.data));
        Alert.alert('Success', 'Master created successfully'); 
        navigation.navigate('MasterHomeScreen');
      } else {
        Alert.alert('Error', result.message || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit');
    } finally {
      setLoading(false); // Hide loading screen
    }
  };

  const renderInput = (placeholder, field, isNumeric = false) => (
    <TextInput
      style={[
        styles.input,
        focusedField === field && styles.focusedInput,
      ]}
      placeholder={placeholder}
      keyboardType={isNumeric ? 'numeric' : 'default'}
      value={formData[field]}
      editable={field !== 'phone'}
      onFocus={() => setFocusedField(field)}
      onBlur={() => setFocusedField(null)}
      onChangeText={val => handleInputChange(field, val)}
    />
  );

  const renderAddressInput = (placeholder, field, isNumeric = false) => (
    <TextInput
      style={[
        styles.input,
        focusedField === field && styles.focusedInput,
      ]}
      placeholder={placeholder}
      keyboardType={isNumeric ? 'numeric' : 'default'}
      value={formData.shopAddress[field]}
      onFocus={() => setFocusedField(field)}
      onBlur={() => setFocusedField(null)}
      onChangeText={val => handleAddressChange(field, val)}
    />
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.subtitle}>Enter Your Details {"\n"}for your Profile</Text>
    <Text style={styles.subtitletext}>Enter Your Details correctly for Profile</Text>
      <RequiredLabel label="Name " />
      {renderInput("Enter your name", "name")}

      <RequiredLabel label="Phone Number " />
      {renderInput("Enter phone number", "phone", true)}

      <RequiredLabel label="Aadhar Number " />
      {renderInput("Enter Aadhar Number", "aadharNumber")}

      <RequiredLabel label="PAN Card Number " />
      {renderInput("Enter PAN Number", "pancardNumber")}

      <RequiredLabel label="Emergency Contact Number " />
      {renderInput("Enter Emergency Contact Number", "emergencyContactNumber")}

      <Text style={styles.subheading}>Shop Address</Text>
      <RequiredLabel label="Address Line " />
      {renderAddressInput("Enter address line", "addressLine")}

      <RequiredLabel label="State " />
      {renderAddressInput("Enter state", "state")}

      <RequiredLabel label="Pincode " />
      {renderAddressInput("Enter pincode", "pincode", true)}

      <RequiredLabel label="Type of Repairs " />
      <View style={styles.checkboxContainer}>
        {REPAIRS.map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => toggleSelect('typeOfRepairs', item)}
            style={[
              styles.chip,
              formData.typeOfRepairs.includes(item) && styles.selectedChip,
            ]}
          >
            <Text style={styles.chipText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <RequiredLabel label="Vehicles Handled " />
      <View style={styles.checkboxContainer}>
        {VEHICLES.map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => toggleSelect('vehicleTypesHandled', item)}
            style={[
              styles.chip,
              formData.vehicleTypesHandled.includes(item) && styles.selectedChip,
            ]}
          >
            <Text style={styles.chipText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

    
      <TouchableOpacity onPress={pickMasterPhoto} style={styles.photoContainer}>
        {masterPhoto ? (
          <Image source={{ uri: masterPhoto.uri }} style={styles.photo} />
        ) : (
          <Text style={styles.photoPlaceholder}>Pick Master Photo</Text>
        )}
      </TouchableOpacity>

      <View style={styles.submitContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: '#fff',
  },
  subtitle: {
      textAlign: "left",
      color: COLORS.textDark,
      fontSize: FONTS.extraLarge,
      marginBottom: 5,
      fontFamily: FONT_FAMILY.bold,
    },
    subtitletext: {
      color: COLORS.text,
      marginBottom: 30,
      fontFamily: FONT_FAMILY.regular,
    },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  focusedInput: {
    borderColor: '#007bff',
    backgroundColor: '#eaf3ff',
  },
  photoContainer: {
    backgroundColor: '#f2f2f2',
    height: 160,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  photoPlaceholder: {
    color: '#666',
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    margin: 4,
  },
  selectedChip: {
    backgroundColor: '#007bff',
  },
  chipText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MasterOnboardingScreen;
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
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { SIZES, FONT_FAMILY, FONTS, API } from '../../../constants/constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { use } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingBars from '../../../components/reuableComponents/loadingBars';


const BASE_URL = `${API}`;

const EditUserProfile = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
  });

    // Get the userData from the async storage
  useEffect(() => {  
    const fetchUserData = async () => {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setFormData({
        name:  userData?.name || '',
        email:  userData?.email || '',
        phone:  userData?.phone || '',
        gender:  userData?.gender || '',
        dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
      });
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.put(`${BASE_URL}/user/${userData._id}`, {
        ...formData,
        dob: formData.dob ? new Date(formData.dob) : null,
      });

      if (response.status === 200) {
        await updateUser(response.data.user);
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
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
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your name"
              placeholderTextColor={colors.textLight}
            /> 
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.phone}
              placeholder="Phone number"
              placeholderTextColor={colors.textLight}
              editable={false}
            />
            <Text style={styles.helperText}>Phone number cannot be changed</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    { borderColor: colors.border, backgroundColor: colors.secondary },
                    formData.gender === gender && styles.selectedGender
                  ]}
                  onPress={() => handleInputChange('gender', gender)}
                >
                  <Text style={[
                    styles.genderText,
                    { color: colors.textDark },
                    formData.gender === gender && styles.selectedGenderText
                  ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add the date of birth by using calender picker or text input */}
          {/* give me the calender picker code  */}
  
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={formData.dob}
              onChangeText={(value) => handleInputChange('dob', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textLight}
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
            <Text style={[styles.saveButtonText, { color: colors.secondary }]}>Save Changes</Text>
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
  },
  helperText: {
    fontSize: FONTS.small, 
    color: '#888',
    marginTop: 5,
    fontFamily: FONT_FAMILY.regular, 
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: SIZES.borderRadius, 
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedGender: {
    borderColor: '#007BFF', // Will be overridden by dynamic color
    backgroundColor: '#e3f2fd',
  },
  genderText: {
    fontSize: FONTS.medium, 
    fontFamily: FONT_FAMILY.regular, 
  },
  selectedGenderText: {
    color: '#007BFF', // Will be overridden by dynamic color
    fontFamily: FONT_FAMILY.bold, 
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

export default EditUserProfile;
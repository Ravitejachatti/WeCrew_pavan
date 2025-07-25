import React, { useState, useEffect,useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import CustomDatePicker from '../../components/reuableComponents/datePicker';
import { useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";


const MasterOnboarding = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const phone = route.params?.phone || ''; // Get phone number from params if available
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    emergencyContactNumber: '',
    bloodGroup: '',
    dob: '',
    documents: {
      drivingLicence: { number: '', issueDate: '', expiryDate: '', images: {} },
      aadhar: { number: '', images: {} },
      pancard: { number: '', images: {} },
    },
    storeAddress: {
      addressLine1: '',
      addressLine2: '',
      city: 'Visakhapatnam', // Default city
      state: 'Andhra Pradesh', // Default state
      country: 'India', // Default country
      postalCode: '',
    },
    masterAddress: {
      addressLine1: '',
      addressLine2: '',
      city: 'Visakhapatnam', // Default city
      state: 'Andhra Pradesh', // Default state
      country: 'India', // Default country
      postalCode: '',
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    },
  });
  
  const [ date, setDate] = useState(new Date());
  const [show, setShow] = useState(false)
  const [selectedGender, setSelectedGender] = useState('Male');
  const [selectedUploadBox, setSelectedUploadBox] = useState(null);
  const [userStateList, setUserStateList] = useState([]); 
  const [userCityList, setUserCityList] = useState([]);
  const [masterStateList, setMasterStateList] = useState([]);
  const [masterCityList, setMasterCityList] = useState([]);
  const [loadingCities, setLoadingCities] = useState([])
  const [loading, setLoading] = useState(false); // Loading state
  const rotateAnim = useRef(new Animated.Value(0)).current; // Animation reference


useEffect(() => {
  fetchStates(setUserStateList);
  fetchStates(setMasterStateList);
  fetchCities({ name: 'Andhra Pradesh' }, setUserCityList).then(() => setLoadingCities(false));
  fetchCities({ name: 'Andhra Pradesh' }, setMasterCityList).then(() => setLoadingCities(false));
}, []);

    // Rotate animation
    useEffect(() => {
      if (loading) {
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();
      } else {
        rotateAnim.stopAnimation();
      }
    }, [loading]);
  
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

  const fetchStates = async (setList) => {
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'India' }),
      });
      const data = await res.json();
      if (data?.data?.states) setList(data.data.states);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (state, setList) => {
    try {
      if (!state || !state.name) {
        
        return;
      }
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'India', state: state.name }),

      });
      const data = await res.json();
      console.log('Cities API response:', data); // Log the API response
      if (data?.data) {
        setList(data.data);
      } else {
        console.error('No cities found for the selected state.');
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleNestedChange = (path, value) => {
    const keys = path.split('.');
    setFormData((prev) => {
      const updated = { ...prev };
      let current = updated;
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = value;
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
      
      if(path === 'storeAddress.state'){
        setLoadingCities(true)
        fetchCities(value, setUserCityList).then(() => setLoadingCities(false));
      }else if(path == 'masterAddress.state') {
        setLoadingCities(true);
        fetchCities(value, setMasterCityList).then(() => setLoadingCities(false));
      }
      return updated;
    });
  };

  const handleImageUpload = async (path) => {
    setSelectedUploadBox(path);
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      handleNestedChange(path, result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    
    const formDataToSend = new FormData();
    console.log(formDataToSend, "formDataToSend");
  
    // Appending the non-image fields
    formDataToSend.append('name', formData.name || '');
    formDataToSend.append('phone', phone || '');
    formDataToSend.append('email', formData.email || '');
    formDataToSend.append('gender', selectedGender || '');
    formDataToSend.append('emergencyContactNumber', formData.emergencyContactNumber || '');
    formDataToSend.append('bloodGroup', formData.bloodGroup || '');
    formDataToSend.append('dob', formData.dob || '');
  
    // Appending driving license details
    formDataToSend.append('documents.drivingLicence.number', formData.documents.drivingLicence.number || '');
    formDataToSend.append('documents.drivingLicence.issueDate', formData.documents.drivingLicence.issueDate || '');
    formDataToSend.append('documents.drivingLicence.expiryDate', formData.documents.drivingLicence.expiryDate || '');
  
    // Appending Aadhar card details
    formDataToSend.append('documents.aadhar.number', formData.documents.aadhar.number || '');
  
    // Appending PAN card details
    formDataToSend.append('documents.pancard.number', formData.documents.pancard.number || '');
  
    // Appending driving license images
    if (formData.documents.drivingLicence.images.front) {
      formDataToSend.append('documents.drivingLicence.images.front', {
        uri: formData.documents.drivingLicence.images.front,
        type: 'image/jpeg',
        name: 'drivingLicenceFront.jpg',
      });
    }
    if (formData.documents.drivingLicence.images.back) {
      formDataToSend.append('documents.drivingLicence.images.back', {
        uri: formData.documents.drivingLicence.images.back,
        type: 'image/jpeg',
        name: 'drivingLicenceBack.jpg',
      });
    }
  
    // Appending Aadhar card images
    if (formData.documents.aadhar.images.front) {
      formDataToSend.append('documents.aadhar.images.front', {
        uri: formData.documents.aadhar.images.front,
        type: 'image/jpeg',
        name: 'aadharFront.jpg',
      });
    }
    if (formData.documents.aadhar.images.back) {
      formDataToSend.append('documents.aadhar.images.back', {
        uri: formData.documents.aadhar.images.back,
        type: 'image/jpeg',
        name: 'aadharBack.jpg',
      });
    }
  
    // Appending PAN card images
    if (formData.documents.pancard.images.front) {
      formDataToSend.append('documents.pancard.images.front', {
        uri: formData.documents.pancard.images.front,
        type: 'image/jpeg',
        name: 'pancardFront.jpg',
      });
    }
    if (formData.documents.pancard.images.back) {
      formDataToSend.append('documents.pancard.images.back', {
        uri: formData.documents.pancard.images.back,
        type: 'image/jpeg',
        name: 'pancardBack.jpg',
      });
    }
  
    // Appending store address details
    formDataToSend.append('storeAddress.addressLine1', formData.storeAddress.addressLine1 || '');
    formDataToSend.append('storeAddress.addressLine2', formData.storeAddress.addressLine2 || '');
    formDataToSend.append('storeAddress.city', formData.storeAddress.city || '');
    formDataToSend.append('storeAddress.state', formData.storeAddress.state || '');
    formDataToSend.append('storeAddress.country', formData.storeAddress.country || '');
    formDataToSend.append('storeAddress.postalCode', formData.storeAddress.postalCode || '');
  
    // Appending master address details
    formDataToSend.append('masterAddress.addressLine1', formData.masterAddress.addressLine1 || '');
    formDataToSend.append('masterAddress.addressLine2', formData.masterAddress.addressLine2 || '');
    formDataToSend.append('masterAddress.city', formData.masterAddress.city || '');
    formDataToSend.append('masterAddress.state', formData.masterAddress.state || '');
    formDataToSend.append('masterAddress.country', formData.masterAddress.country || '');
    formDataToSend.append('masterAddress.postalCode', formData.masterAddress.postalCode || '');
  
    // Appending bank details
    formDataToSend.append('bankDetails.bankName', formData.bankDetails.bankName || '');
    formDataToSend.append('bankDetails.accountNumber', formData.bankDetails.accountNumber || '');
    formDataToSend.append('bankDetails.ifscCode', formData.bankDetails.ifscCode || '');
  
    // Log the contents of formDataToSend
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    setLoading(true); // Show loading screen
    console.log(loading)
    try {
      const response = await fetch('https://192.168.20.93:3000/api/master', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.title}>Master Onboarding</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput style={styles.cardInput} onChangeText={(val) => handleNestedChange('name', val)} placeholder="Enter name" />

            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput style={styles.cardInput} value={phone} placeholder="Phone" keyboardType='phone-pad' editable={false}/>

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.cardInput} onChangeText={(val) => handleNestedChange('email', val)} placeholder="Email"  keyboardType='email-address' />

            <Text style={styles.fieldLabel}>Emergency Contact Number</Text>
            <TextInput style={styles.cardInput} onChangeText={(val) => handleNestedChange('emergencyContactNumber', val)} placeholder="Emergency Contact Number" keyboardType='phone-pad' />
            
            <Text style={styles.fieldLabel}>Blood Group</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.bloodGroup} // Bind to formData
                onValueChange={(value) => handleNestedChange('bloodGroup', value)} // Update formData on change
                style={styles.picker} // Apply picker-specific styles
              >
                <Picker.Item label="Select Blood Group" value="" style={{ color: '#aaa' }} /> {/* Placeholder */}
                <Picker.Item label="A+" value="A+" />
                <Picker.Item label="A-" value="A-" />
                <Picker.Item label="B+" value="B+" />
                <Picker.Item label="B-" value="B-" />
                <Picker.Item label="AB+" value="AB+" />
                <Picker.Item label="AB-" value="AB-" />
                <Picker.Item label="O+" value="O+" />
                <Picker.Item label="O-" value="O-" />
              </Picker>
            </View>


            <CustomDatePicker
              label="DOB"
              value={formData.dob}
              onChange={(val) => handleNestedChange('dob', val)}
            />

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedGender} onValueChange={(val) => setSelectedGender(val)}>
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
            </View>

  {/* 📄 Driving License */}
  <View style={styles.cardSection}>
    <Text style={styles.sectionTitle}>Driving License</Text>
    <Text style={styles.fieldLabel}>DL Number</Text>
    <TextInput placeholder="DL Number" onChangeText={(val) => handleNestedChange('documents.drivingLicence.number', val)} style={styles.cardInput} />
   
    <CustomDatePicker
      label="Issue Date"
      value={formData.documents.drivingLicence.issueDate}
      onChange={(val) => handleNestedChange('documents.drivingLicence.issueDate', val)}
    />

  
    <CustomDatePicker
      label="Expiry Date"
      value={formData.documents.drivingLicence.expiryDate}
      onChange={(val) => handleNestedChange('documents.drivingLicence.expiryDate', val)}
    />

{formData.documents.drivingLicence.images.front ? (
  <View>
    <Image
      source={{ uri: formData.documents.drivingLicence.images.front }}
      style={styles.imagePreview}
    />
    <TouchableOpacity
      onPress={() => handleImageUpload('documents.drivingLicence.images.front')}
      style={styles.editButton}
    >
      <Ionicons name="pencil-outline" size={20} color="#2563eb" />
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>
  </View>
) : (
  <TouchableOpacity
    onPress={() => handleImageUpload('documents.drivingLicence.images.front')}
    style={[styles.uploadCardBox, selectedUploadBox === 'documents.drivingLicence.images.front' && { borderColor: '#2563eb' }]}
  >
    <Ionicons name="camera-outline" size={36} color="#2563eb" />
    <Text style={styles.uploadText}>Upload DL Front</Text>
  </TouchableOpacity>
)}
  
   {formData.documents.drivingLicence.images.back ? (
    <Image 
      source={{ uri: formData.documents.drivingLicence.images.back }} // Incorrect attribute
      style={styles.imagePreview}
    />
    ) : (
      // Upload Back
    <TouchableOpacity
      onPress={() => handleImageUpload('documents.drivingLicence.images.back')}
      style={[
        styles.uploadCardBox,
        selectedUploadBox === 'documents.drivingLicence.images.back' && { borderColor: '#2563eb' },
      ]}
    >
      <Ionicons name="camera-outline" size={36} color="#2563eb" />
      <Text style={styles.uploadText}>Upload DL Back</Text>
      </TouchableOpacity> // Incorrect closing tag
        )
    }
  </View>



  {/* 🆔 Aadhar Card */}
  <View style={styles.cardSection}>
    <Text style={styles.sectionTitle}>Aadhar Card</Text>
    <Text style={styles.fieldLabel}>Aadhar Number</Text>
    <TextInput placeholder="Aadhar Number" onChangeText={(val) => handleNestedChange('documents.aadhar.number', val)} style={styles.cardInput} />

    {/* Upload Front */}
    {formData.documents.aadhar.images.front ? (
      <Image
      source={{ uri: formData.documents.aadhar.images.front}}
      style={styles.imagePreview}
      />
    ):(
      <TouchableOpacity onPress={() => handleImageUpload('documents.aadhar.images.front')} 
      style={[styles.uploadCardBox, selectedUploadBox === 'documents.aadhar.images.front' && { borderColor: '#2563eb' }]}
      >
        <Ionicons name="camera-outline" size={36} color="#2563eb" />
        <Text style={styles.uploadText}>Upload Aadhar Front</Text>
      </TouchableOpacity>
    )}


    {/* <TouchableOpacity onPress={() => handleImageUpload('documents.aadhar.images.front')} style={[styles.uploadCardBox, selectedUploadBox === 'documents.aadhar.images.front' && { borderColor: '#2563eb' }]}>
      <Ionicons name="camera-outline" size={36} color="#2563eb" />
      <Text style={styles.uploadText}>Upload Aadhar Front</Text>
    </TouchableOpacity>
    {formData.documents.aadhar.images.front && (
      <Image
        source={{ uri: formData.documents.aadhar.images.front }}
        style={styles.imagePreview}
      />
    )} */}

    {/* Upload Back */}
    {formData.documents.aadhar.images.back ? (
      <Image
      source={{ uri: formData.documents.aadhar.images.back}}
      style={styles.imagePreview}
      />
    ):(
      <TouchableOpacity onPress={() => handleImageUpload('documents.aadhar.images.back')} 
      style={[styles.uploadCardBox, selectedUploadBox === 'documents.aadhar.images.back' && { borderColor: '#2563eb' }]}
      >
        <Ionicons name="camera-outline" size={36} color="#2563eb" />
        <Text style={styles.uploadText}>Upload Aadhar Back</Text>
      </TouchableOpacity>
    )}
  </View>


  {/* 🧾 PAN Card */}
  <View style={styles.cardSection}>
    <Text style={styles.sectionTitle}>PAN Card</Text>
    <Text style={styles.fieldLabel}>PAN Number</Text>
    <TextInput placeholder="PAN Number" onChangeText={(val) => handleNestedChange('documents.pancard.number', val)} style={styles.cardInput} />

    {/* Upload Front */}
    {formData.documents.pancard.images.front ? (
      <Image
      source={{ uri: formData.documents.pancard.images.front}}
      style={styles.imagePreview}
      />
    ):(
      <TouchableOpacity onPress={() => handleImageUpload('documents.pancard.images.front')} 
      style={[styles.uploadCardBox, selectedUploadBox === 'documents.pancard.images.front' && { borderColor: '#2563eb' }]}
      >
        <Ionicons name="camera-outline" size={36} color="#2563eb" />
        <Text style={styles.uploadText}>Upload pancard Front</Text>
      </TouchableOpacity>
    )}

    {/* Upload Back */}
    {formData.documents.pancard.images.back ? (
      <Image
      source={{ uri: formData.documents.pancard.images.back}}
      style={styles.imagePreview}
      />
    ):(
      <TouchableOpacity onPress={() => handleImageUpload('documents.pancard.images.back')} 
      style={[styles.uploadCardBox, selectedUploadBox === 'documents.pancard.images.back' && { borderColor: '#2563eb' }]}
      >
        <Ionicons name="camera-outline" size={36} color="#2563eb" />
        <Text style={styles.uploadText}>Upload pancard Back</Text>
      </TouchableOpacity>
    )}
  </View>

  {/* 🏬 Store Address */}
  <View style={styles.cardSection}>
    <Text style={styles.sectionTitle}>Store Address</Text>
    <Text style={styles.fieldLabel}>Address Line 1</Text>
    <TextInput placeholder="Address Line 1" onChangeText={(val) => handleNestedChange('storeAddress.addressLine1', val)} style={styles.cardInput} />
    <Text style={styles.fieldLabel}>Address Line 2</Text>
    <TextInput placeholder="Address Line 2" onChangeText={(val) => handleNestedChange('storeAddress.addressLine2', val)} style={styles.cardInput} />
    

    <Text style={styles.fieldLabel}>Country</Text>
    <TextInput
      value={formData.storeAddress.country} // Bind to formData
      onChangeText={(val) => handleNestedChange('storeAddress.country', val)} // Allow editing
      style={styles.cardInput}
    />

  <Text style={styles.fieldLabel}>State</Text>
<View style={styles.pickerContainer}>
<Picker
  selectedValue={formData.storeAddress.state}
  onValueChange={(value) => {
    handleNestedChange('storeAddress.state', value);
    fetchCities({ name: value }, setUserCityList);
  }}
  style={styles.picker}
>
  <Picker.Item label="Select State" value="" />
  {userStateList.map((state, index) => (
    <Picker.Item key={index} label={state.name} value={state.name} />
  ))}
</Picker>
</View>

    <Text style={styles.fieldLabel}>City</Text>
    <View style={styles.pickerContainer}>
          {loadingCities ? (
            <Text>Loading cities...</Text> // Show loading indicator
          ) : (
 <Picker
  selectedValue={formData.storeAddress.city}
  onValueChange={(value) => handleNestedChange('storeAddress.city', value)}
>
  <Picker.Item label="Select City" value="" />
  {userCityList.map((city, index) => (
    <Picker.Item key={index} label={city} value={city} />
  ))}
</Picker>
            )}
            </View>

    
    <Text style={styles.fieldLabel}>Postal Code</Text>
    <TextInput placeholder="Postal Code" onChangeText={(val) => handleNestedChange('storeAddress.postalCode', val)} style={styles.cardInput} />
  </View>

  {/* 🏠 Master Address */}
  <View style={styles.cardSection}>
    <Text style={styles.sectionTitle}>Master Address</Text>
    <Text style={styles.fieldLabel}>Address Line 1</Text>
    <TextInput placeholder="Address Line 1" onChangeText={(val) => handleNestedChange('masterAddress.addressLine1', val)} style={styles.cardInput} />
    <Text style={styles.fieldLabel}>Address Line 2</Text>
    <TextInput placeholder="Address Line 2" onChangeText={(val) => handleNestedChange('masterAddress.addressLine2', val)} style={styles.cardInput} />
    <Text style={styles.fieldLabel}>Country</Text>
    <TextInput
      value={formData.masterAddress.country} // Bind to formData
      onChangeText={(val) => handleNestedChange('masterAddress.country', val)} // Allow editing
      style={styles.cardInput}
    />
    <Text style={styles.fieldLabel}>State</Text>
    <View style={styles.pickerContainer}>
      {userStateList.length > 0 && userStateList.some(s => s.name === formData.storeAddress.state) && (
        <Picker
          selectedValue={formData.masterAddress.state}
          onValueChange={(value) => {
            handleNestedChange('masterAddress.state', value);
            fetchCities({ name: value }, setUserCityList);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select State" value="" />
          {userStateList.map((state, index) => (
            <Picker.Item key={index} label={state.name} value={state.name} />
          ))}
        </Picker>
        )}
      </View>

        <Text style={styles.fieldLabel}>City</Text>
        <View style={styles.pickerContainer}>
          {loadingCities ? (
            <Text>Loading cities...</Text>
          ) : (
            masterCityList.length > 0 && masterCityList.includes(formData.masterAddress.city) && (
              <Picker
                selectedValue={formData.masterAddress.city}
                onValueChange={(value) => handleNestedChange('masterAddress.city', value)}
              >
                <Picker.Item label="Select City" value="" />
                {masterCityList.map((city, index) => (
                  <Picker.Item key={index} label={city} value={city} />
                ))}
              </Picker>
            )
          )}
        </View>

    <Text style={styles.fieldLabel}>Postal Code</Text>
    <TextInput placeholder="Postal Code" onChangeText={(val) => handleNestedChange('masterAddress.postalCode', val)} style={styles.cardInput} />
  </View>

  {/* 🏦 Bank Details */}
  <View style={styles.cardSection}>
    <Text style={styles.sectionTitle}>Bank Details</Text>
    <Text style={styles.fieldLabel}>Bank Name</Text>
    <TextInput placeholder="Bank Name" onChangeText={(val) => handleNestedChange('bankDetails.bankName', val)} style={styles.cardInput} />
    <Text style={styles.fieldLabel}>Account Number</Text>
    <TextInput placeholder="Account Number" onChangeText={(val) => handleNestedChange('bankDetails.accountNumber', val)} style={styles.cardInput} />
    <Text style={styles.fieldLabel}>IFSC Code</Text>
    <TextInput placeholder="IFSC Code" onChangeText={(val) => handleNestedChange('bankDetails.ifscCode', val)} style={styles.cardInput} />
  </View>

          </ScrollView>
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
         {/* Loading Modal */}
    {loading && (
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loadingContainer}>
          <Animated.Text style={[styles.loadingEmoji, { transform: [{ rotate: rotation }] }]}>
            🛠️
          </Animated.Text>
          <Text style={styles.loadingText}>Submitting...</Text>
        </View>
      </Modal>
    )}
    </SafeAreaView>
  );
};

export default MasterOnboarding;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONTS.large,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    marginBottom: SIZES.margin / 2,
    textAlign: "center",
  },
  cardInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textDark,
  },
  uploadCardBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.textLight,
    borderRadius: SIZES.borderRadius,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.secondary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
    fontWeight: "bold",
  },
  cardSection: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
    marginBottom: 12,
    alignSelf: 'center',
    color: COLORS.textDark,
  },
  fieldLabel: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.small,
    marginBottom: 6,
    color: COLORS.textDark,
  },
  uploadText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    marginTop: 10,
    textAlign: 'center',
    fontSize: FONTS.small,
  },
  uploadLimitText: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: 4,
    fontFamily: FONT_FAMILY.regular,
  },
  submitButtonContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  imagePreview: {
    width: 150,
    height: 100,
    borderRadius: SIZES.borderRadius,
    marginTop: 8,
    marginBottom: 10,
    alignSelf: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: 48,
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
  },
  picker: {
    color: COLORS.textDark,
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: FONTS.large,
    color: COLORS.secondary,
    fontFamily: FONT_FAMILY.bold,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'center',
  },
  editButtonText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    marginLeft: 4,
    fontSize: FONTS.small,
  },
});
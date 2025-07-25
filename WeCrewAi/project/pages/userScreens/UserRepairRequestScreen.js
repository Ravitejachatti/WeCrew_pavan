import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import UserBottomNavigator from '../../components/UserBottomNavigator';
import RepairRequestSheet from '../../components/RepairRequestSheet';
import AssigningMasterModal from '../../components/AssigningMasterModal';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import axios from 'axios';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const BASE_URL = "http://10.156.44.93:3000/api";

const UserRepairRequestScreen = ({ navigation, route }) => {
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openVehicleDropdown, setOpenVehicleDropdown] = useState(false);
  const [openServiceDropdown, setOpenServiceDropdown] = useState(false);
  const [serviceType, setServiceType] = useState('Road Assistance');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressValue, setEditAddressValue] = useState('');
  const serviceOptions = ['Road Assistance', 'Tires & Wheels', 'Towing'];
  const [userId, setUserId] = useState(null);

  // For loading indicator during request submission
  const [submitLoading, setSubmitLoading] = useState(false);
  // For Assigning Master Modal
  const [assigningModalVisible, setAssigningModalVisible] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const vehicleDetails = await AsyncStorage.getItem('UserVehicleDetails');
      console.log("User Vehicle Details:", vehicleDetails);
      console.log("User Data:", userData);

      let vehicleArr = [];
      let userId = null;

      if (userData) {
        const parsed = JSON.parse(userData);
        userId = parsed._id;
        vehicleArr = parsed.VehicleDetails || [];
      }
      if (vehicleDetails) {
        let localVehicles = JSON.parse(vehicleDetails);
        if (!Array.isArray(localVehicles)) localVehicles = [];
        // Merge, avoiding duplicates by registrationNumber
        vehicleArr = [
          ...vehicleArr,
          ...localVehicles.filter(
            lv => !vehicleArr.some(v => v.registrationNumber === lv.registrationNumber)
          ),
        ];
      }
      setUserId(userId);

      // Always ensure vehicleArr is an array
      if (!Array.isArray(vehicleArr)) vehicleArr = [];

      setVehicles(
        vehicleArr.map(v => ({
          ...v,
          regNumber: v.registrationNumber,
          type: v.vehicleType,
        }))
      );
      setSelectedVehicle(
        vehicleArr.length > 0
          ? {
              ...vehicleArr[0],
              regNumber: vehicleArr[0].registrationNumber,
              type: vehicleArr[0].vehicleType,
            }
          : null
      );
      await getCurrentLocation();
    } catch (err) {
      setVehicles([]);
      setSelectedVehicle(null);
      setAddress('');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // Function to get current location using expo-location
  const getCurrentLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setAddress('Location permission denied. Please enable location services in your device settings.');
      setLat(null);
      setLon(null);
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setLat(latitude);
    setLon(longitude);
    // Reverse geocode using OpenStreetMap Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    if (data && data.display_name) {
      setAddress(data.display_name);
    } else {
      // If API unable to fetch location, prompt user to enter manually
      Alert.alert(
        "Location Error",
        "Unable to fetch your address automatically. Please enter your location manually.",
        [
          {
            text: "OK",
            onPress: () => {
              setIsEditingAddress(true);
              setEditAddressValue('');
            }
          }
        ]
      );
      setAddress('');
    }
  } catch (e) {
    // If API unable to fetch location, prompt user to enter manually
    Alert.alert(
      "Location Error",
      "Unable to fetch your address automatically. Please enter your location manually.",
      [
        {
          text: "OK",
          onPress: () => {
            setIsEditingAddress(true);
            setEditAddressValue('');
          }
        }
      ]
    );
    setAddress('');
  }
};

  const handleAddressChange = () => {
    setEditAddressValue(address);
    setIsEditingAddress(true);
  };

  const handleSaveAddress = () => {
    setAddress(editAddressValue);
    setIsEditingAddress(false);
    // Optionally, you can keep lat/lon as is, or clear them if you want to force user to reselect location
  };

  const handleRequestPermission = async () => {
    await getCurrentLocation();
  };

  // Handle the API request when user clicks "Proceed" in the sheet
  const handleSubmitRequest = async () => {
    if (!userId || !selectedVehicle || !serviceType || !address) {
      Alert.alert("Missing Data", "Please fill all required fields.");
      return;
    }
    try {
      setSubmitLoading(true);
      setSheetVisible(false);
      const payload = {
        userId: userId,
        vehicleId: selectedVehicle._id,
        serviceType: serviceType,
        location: {
          address: address,
          lat: lat,
          lon: lon,
        }
      };
      const response = await axios.post(`${BASE_URL}/request/`, payload);
      console.log("Response of request from database", response.data);
      // Check if UserRepairRequestResponse already exists
      const existing = await AsyncStorage.getItem('UserRepairRequestResponse');
      if (existing) {
        //remove the UserRepairRequestResponse in the async storage
        await AsyncStorage.removeItem('UserRepairRequestResponse');
        await AsyncStorage.removeItem('MasterAssignedToRequest');
        // Update with new data
        await AsyncStorage.setItem('UserRepairRequestResponse', JSON.stringify(response.data));
      } else {
        // Set for the first time
        await AsyncStorage.setItem('UserRepairRequestResponse', JSON.stringify(response.data));
      }
      if (response.status === 200 || response.status === 201) {
        setAssigningModalVisible(true); // Show Assigning Master Modal
      } else {
        Alert.alert("Error", "Failed to submit request. Check your internet connection and try again.");
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to submit request. Check your internet connection and try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Repair Request</Text>

      <View style={styles.card}>
        {/* Vehicle Dropdown and Info side by side */}
        <View style={styles.vehicleRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Vehicle Number</Text>
            <DropDownPicker
              open={openVehicleDropdown}
              value={selectedVehicle?.regNumber}
              items={vehicles.map(v => ({ label: v.regNumber, value: v.regNumber }))}
              setOpen={setOpenVehicleDropdown}
              setValue={val => {
                const newVehicle = vehicles.find(v => v.regNumber === val);
                setSelectedVehicle(newVehicle);
              }}
              style={styles.dropdownNoBorder}
              dropDownContainerStyle={styles.dropdownNoBorder}
              containerStyle={{ width: '100%' }}
              zIndex={2000}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Your Vehicle</Text>
            <View style={[styles.dropdownNoBorder, { justifyContent: 'center', minHeight: 40 }]}>
              <Text style={{ color: '#333', fontSize: 16 }}>
                {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.type || selectedVehicle.vehicleType || ''}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <Text style={styles.addresslabel}>Your Current Address</Text>
          <TouchableOpacity onPress={handleAddressChange}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Always show the current address */}
        {!isEditingAddress && (
          <Text style={styles.addressInput}>
            {address || 'Fetching address...'}
          </Text>
        )}

        {isEditingAddress && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <TextInput
              style={[styles.addressInput, { flex: 1 }]}
              value={editAddressValue}
              onChangeText={setEditAddressValue}
              placeholder="Enter your address"
              multiline
            />
            <TouchableOpacity onPress={handleSaveAddress} style={{ marginLeft: 10 }}>
              <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isEditingAddress && address.startsWith('Location permission denied') && (
          <TouchableOpacity onPress={handleRequestPermission} style={{ marginTop: 5 }}>
            <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Allow Location Access</Text>
          </TouchableOpacity>
        )}

        {/* Service Dropdown */}
        <Text style={styles.addresslabel}>Service Requested</Text>
        <DropDownPicker
          open={openServiceDropdown}
          value={serviceType}
          items={serviceOptions.map(s => ({ label: s, value: s }))}
          setOpen={setOpenServiceDropdown}
          setValue={setServiceType}
          style={styles.dropdownNoBorder}
          dropDownContainerStyle={styles.dropdownNoBorder}
          containerStyle={{ marginBottom: openServiceDropdown ? 120 : 10 }}
        />
      </View>

      <TouchableOpacity style={styles.requestButton} onPress={() => setSheetVisible(true)}>
        <Text style={styles.requestButtonText}>Request Repair</Text>
      </TouchableOpacity>

      <RepairRequestSheet
        isVisible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        navigation={navigation}
        vehicle={selectedVehicle}
        address={address}
        serviceType={serviceType}
        lat={lat}
        lon={lon}
        onProceed={handleSubmitRequest}
      />

      {/* Loading indicator for submit */}
      {submitLoading && (
        <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      )}

      {/* Assigning Master Modal */}
      <AssigningMasterModal
        visible={assigningModalVisible}
        onClose={() => setAssigningModalVisible(false)}
        masterAssigned={false}
        navigation={navigation} // <-- Add this line
      />

      <UserBottomNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF', padding: 20 },
  header: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, elevation: 2 },
  label: { color: '#777', marginTop: 10, fontSize: 14 },
  value: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  addressSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  changeText: { color: '#FE5E00', fontWeight: 'bold' },
  addresslabel: { color: '#777', fontSize: 14, margin: 10 },
  addressInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, backgroundColor: '#f8f8f8', fontSize: 14 },
  requestButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 20 },
  requestButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  vehicleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  dropdownNoBorder: {
    borderWidth: 0,
    borderRadius: 10,
    elevation: 0,
    backgroundColor: '#f8f8f8',
    minHeight: 40,
  },
});

export default UserRepairRequestScreen;
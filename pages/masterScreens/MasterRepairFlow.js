import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, TouchableOpacity } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
import SlideToConfirm from '../../components/reuableComponents/slidebar'; // assuming you have this
import OtpInput from 'react-native-otp-textinput'; // example otp input library
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const MasterRepairFlow = ({ route, navigation }) => {
  const [step, setStep] = useState('enterOtp');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState('02:48'); // Can add timer logic

  // const { latitude = 17.738, longitude = 83.301 } = route?.params || {}; // Example coords

  const handleSlide = () => {
    if (step === 'atRepair') setStep('verifyOtpPrompt');
    else if (step === 'verifyOtpPrompt') setStep('enterOtp');
    else if (step === 'enterOtp') setStep('otpVerified');
    else if (step === 'otpVerified') console.log('Complete Repair');
  };

  const renderModalContent = () => {
    switch (step) {
      case 'atRepair':
        return (
          <View style={styles.modalBox}>
            <Text style={styles.timerTitle}>ETA To reach the Repair Point</Text>
            <Text style={styles.timerValue}>08:35</Text>
            {/* Customer Info */}
            <CustomerInfo />
            <SlideToConfirm text="At Repair" onSlideComplete={handleSlide} />
          </View>
        );
      case 'verifyOtpPrompt':
        return (
          <View style={styles.modalBox}>
            <Text style={styles.timerTitle}>Verify your Customer within</Text>
            <Text style={styles.timerValue}>{timer}</Text>
            <CustomerInfo />
            <SlideToConfirm text="Verify OTP" onSlideComplete={handleSlide} />
          </View>
        );
      case 'enterOtp':
        return (
          <View style={styles.modalBox}>
            <Text style={styles.timerTitle}>Enter OTP</Text>
            <OtpInput
              inputCount={4}
              handleTextChange={setOtp}
              tintColor="#007bff"
              containerStyle={{ marginVertical: 20 }}
            />
            <View style={styles.actionRow}>
              <ActionButton text="Contact" />
              <ActionButton text="Support" />
              <ActionButton text="Cancel" danger />
            </View>
            <SlideToConfirm text="Start Repair" onSlideComplete={handleSlide} />
          </View>
        );
      case 'otpVerified':
        return (
          <View style={styles.modalBox}>
            <Text style={styles.timerTitle}>Customer OTP verified</Text>
            <CustomerInfo />
            <View style={styles.actionRow}>
              <ActionButton text="Contact" />
              <ActionButton text="Support" />
              <ActionButton text="Raise Ticket" />
            </View>
            <SlideToConfirm text="Complete Repair" onSlideComplete={handleSlide} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView> */}

      <View style={styles.modalContainer}>{renderModalContent()}</View>
    </SafeAreaView>
  );
};

const CustomerInfo = () => (
  <View style={styles.infoCard}>
    <Text style={styles.label}>Repair Point: <Text style={styles.value}>Dwarka Nagar</Text></Text>
    <Text style={styles.label}>Service: <Text style={styles.value}>On Road Asst</Text></Text>
    <Text style={styles.label}>Customer: <Text style={styles.value}>Varun Kumar</Text></Text>
    <Text style={styles.label}>Vehicle: <Text style={styles.value}>AP 31 BX 3454 - Honda Active</Text></Text>
  </View>
);

const ActionButton = ({ text, danger }) => (
  <TouchableOpacity style={[styles.button, danger && { backgroundColor: '#f8d7da' }]}>
    <Text style={[styles.buttonText, danger && { color: '#b00020' }]}>{text}</Text>
  </TouchableOpacity>
);

export default MasterRepairFlow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: SIZES.borderRadius + 9,
    borderTopRightRadius: SIZES.borderRadius + 9,
    padding: SIZES.padding,
    elevation: 10,
  },
  modalBox: {
    gap: 15,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius - 3,
    padding: SIZES.padding - 4,
  },
  label: {
    fontSize: FONTS.small,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.bold,
  },
  value: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  timerTitle: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  timerValue: {
    fontSize: FONTS.large,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.padding - 4,
    paddingVertical: 8,
    borderRadius: SIZES.borderRadius - 7,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    fontSize: FONTS.medium,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, FONT_FAMILY, FONTS } from "../constants/constants";
import { useTheme } from '../contexts/ThemeContext';

const RepairRequestSheet = ({
  isVisible,
  onClose,
  navigation,
  address,
  vehicle,
  onProceed
}) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const [selectedPayment, setSelectedPayment] = useState('Pay Later');

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  // Only close modal if user clicks outside the modal content
  const handleOverlayPress = (event) => {
    if (event.target === event.currentTarget) {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    }
  };

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Title */}
            <Text style={styles.title}>Repair Request Details</Text>
            
            {/* Pickup Location Card */}
            <View style={styles.card}>
              <View style={styles.locationHeader}>
                <Text style={styles.cardTitle}>Pickup Details</Text>
              </View>
              <Text style={styles.boldText}>
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : ''}
              </Text>
              <Text style={styles.cardContent}>
                {address}
              </Text>
            </View>

            {/* Payment Options */}
            <View style={styles.paymentContainer}>
              <TouchableOpacity 
                style={[styles.paymentButton, selectedPayment === 'Pay Now' && styles.selectedPayment]}
                onPress={() => setSelectedPayment('Pay Now')}
              >
                <Text style={[styles.paymentText, selectedPayment === 'Pay Now' && styles.selectedText]}>Pay Now</Text>
                {selectedPayment === 'Pay Now' && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.paymentButton, selectedPayment === 'Pay Later' && styles.selectedPayment]}
                onPress={() => setSelectedPayment('Pay Later')}
              >
                <Text style={[styles.paymentText, selectedPayment === 'Pay Later' && styles.selectedText]}>Pay Later</Text>
                {selectedPayment === 'Pay Later' && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            </View>

            {/* Payment Summary */}
            <View style={styles.paymentSummary}>
              <View style={styles.row}>
                <Text style={styles.summaryText}>Check-Up Fee:</Text>
                <Text style={styles.summaryAmount}>₹ 300</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.summaryText}>Repair Cost:</Text>
                <Text style={styles.summaryAmount}>₹ 200</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.summaryText}>Taxes:</Text>
                <Text style={styles.summaryAmount}>₹ 96</Text>
              </View>
            </View>

            {/* Terms and Conditions */}
            <Text style={styles.termsText}>
              By proceeding, you agree to our 
              <Text style={styles.linkText}> T&C </Text>
              and 
              <Text style={styles.linkText}> Privacy policy</Text>.
            </Text>

            {/* Total Amount */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>₹ 596.00</Text>
            </View>

            {/* Pay Now / Proceed Button */}
            {selectedPayment === 'Pay Now' ? (
              <TouchableOpacity style={[styles.payNowButton, { backgroundColor: '#ccc' }]} disabled={true}>
                <Text style={styles.payNowText}>Feature Adding Soon</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.payNowButton, { backgroundColor: colors.primary }]} 
                onPress={onProceed}
              >
                <Text style={styles.payNowText}>Proceed</Text>
              </TouchableOpacity>
            )}

          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 5,
  },
  cardContent: {
    color: '#555',
    marginTop: 5,
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedPayment: {
    backgroundColor: '#e3f2fd', // Keep light blue for selection
    borderWidth: 1, 
    borderColor: '#007BFF', // Keep blue for border
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
    marginRight: 5,
  },
  selectedText: {
    color: '#007BFF', // Keep blue for selected text
    fontWeight: 'bold',
  },
  paymentSummary: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  payNowButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  payNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RepairRequestSheet;
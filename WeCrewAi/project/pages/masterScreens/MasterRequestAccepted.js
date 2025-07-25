import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SlideToConfirm from '../../components/reuableComponents/slidebar';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const { width, height } = Dimensions.get('window');

const MasterRequestAccepted = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(true);
  const [request, setRequest] = useState(null);

  // Fetch request details from AsyncStorage
  useEffect(() => {
    const fetchRequest = async () => {
      const stored = await AsyncStorage.getItem('AcceptedRequest');
      if (stored) {
        setRequest(JSON.parse(stored));
      }
    };
    fetchRequest();
  }, []);

  const handleAtRepairPoint = () => {
    if (request) {
      navigation.navigate('MasterVerifyOtp');
      setModalVisible(false);
    }
  };

  const handleContactPress = () => {
    let phone = request?.user?.phone;
    if (phone) {
      if (phone.startsWith('91') && phone.length > 10) {
        phone = phone.slice(2);
      }
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>No request details available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isModalVisible && (
        <View style={styles.bottomContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* ETA Info */}
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>ETA To reach the Repair Point</Text>
              <View style={styles.etaBox}>
                <Text style={styles.etaTime}>08:35</Text>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.repairHeader}>
                <Ionicons name="radio-button-on" size={16} color="#007bff" />
                <Text style={styles.repairPoint}>Repair Point</Text>
                <Text style={styles.directions}>
                  {`${request.distanceKm} KM` || 'N/A'} | Directions
                </Text>
              </View>
              <Text style={styles.address}>
                {request.location?.address || 'Unknown Address'}
              </Text>

              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>Service Requested</Text>
                  <Text style={styles.value}>{request.serviceType || 'Unknown Service'}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Customer Name</Text>
                  <Text style={styles.value}>{request.user?.name?.trim() || 'Unknown Name'}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>Vehicle Number</Text>
                  <Text style={styles.value}>{request.user?.vehicleNumber || 'Unknown Number'}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Vehicle Model</Text>
                  <Text style={styles.value}>{request.user?.vehicleModel || 'Unknown Model'}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleContactPress}>
                <Text style={styles.actionText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f8d7da' }]}>
                <Text style={[styles.actionText, { color: '#b00020' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Slide to Confirm Button */}
            <View style={styles.slideContainer}>
              <SlideToConfirm
                onSlideComplete={handleAtRepairPoint}
                text="At Repair Point"
                sliderColor="#fff"
                trackColor="#007bff"
                textColor="#fff"
                direction="right"
              />
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MasterRequestAccepted;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    top: height * 0.45, // Modal starts from 45% height
    left: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: SIZES.borderRadius + 5,
    borderTopRightRadius: SIZES.borderRadius + 5,
  },
  scrollContent: {
    paddingBottom: SIZES.padding + 10,
  },
  etaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding - 5,
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
  },
  etaBox: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: SIZES.borderRadius - 3,
  },
  etaTime: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius + 2,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.margin / 2,
  },
  repairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  repairPoint: {
    marginLeft: 6,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONTS.medium,
    color: COLORS.textDark,
  },
  directions: {
    marginLeft: 'auto',
    color: COLORS.primary,
    fontSize: FONTS.small,
    fontFamily: FONT_FAMILY.bold,
  },
  address: {
    fontSize: FONTS.small,
    color: COLORS.text,
    marginBottom: 15,
    fontFamily: FONT_FAMILY.regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.bold,
  },
  value: {
    fontSize: FONTS.medium,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginHorizontal: SIZES.padding,
  },
  actionBtn: {
    backgroundColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: SIZES.borderRadius - 5,
    alignItems: 'center',
  },
  actionText: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.textDark,
    fontSize: FONTS.medium,
  },
  slideContainer: {
    marginLeft: "11.25%",
    marginBottom: SIZES.margin,
  },
});

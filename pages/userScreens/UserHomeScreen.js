import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import UserBottomNavigator from '../../components/UserBottomNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";
import RequestStatusRedirectButton from '../../components/RequestStatusRedirectButton';
import FuelEVToggle from '../../components/reuableComponents/ToggleButtonEv';

export default function UserHomeScreen() {
  const [isEV, setIsEV] = useState(false);
  const [showEVToggle, setShowEVToggle] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState(null);
  const navigation = useNavigation();

  const translateX = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
  //   return () => backHandler.remove();
  // }, []);

  // Check AsyncStorage for EV vehicle type and get user name
  console.log("username")
  useEffect(() => {
    const checkEVAndUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        console.log("userData ", JSON.parse(userData))      
        if (userData) {
          const parsed = JSON.parse(userData);
          const vehicles = parsed.VehicleDetails || [];
          const hasEV = vehicles.some(
            v => (v.vehicleType && v.vehicleType.toLowerCase() === 'ev') || (v.fuelType && v.fuelType.toLowerCase() === 'ev')
          );
          setShowEVToggle(hasEV);

          // Set user name
          const name = parsed.name ? parsed.name.trim() : parsed?.user?.name;
          setUserName(name);
          console.log("username", name);
        }
      } catch (e) {
        setShowEVToggle(false);
        setUserName('');
      }
    };

    // Set greeting based on time
    const setGreetingMessage = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good Morning🌞');
      else if (hour < 18) setGreeting('Good Afternoon⛅');
      else setGreeting('Good Evening🌆');
    };

    checkEVAndUser();
    setGreetingMessage();
  }, []);

  const toggleSwitch = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isEV ? 0 : 27,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateX, {
        toValue: isEV ? 0 : -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setIsEV(!isEV);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/41.jpg' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.userNameText}>{userName}</Text>
            </View>
          </View>

          {/* Show EV toggle only if user has EV vehicle */}
          <FuelEVToggle onToggle={(isEV) => console.log("User selected:", isEV ? "EV" : "Fuel")}/>
{/* 
            <TouchableOpacity
              style={[styles.toggleButton, isEV ? styles.activeToggle : styles.inactiveToggle]}
              onPress={toggleSwitch}
            >
             
              <Animated.View 
                style={[
                  styles.circle, 
                  { 
                    transform: [{ translateX }], 
                    backgroundColor: isEV ? 'white' : '#007BFF' 
                  }
                ]} 
              />

             
              <Animated.Text
                style={[
                  styles.toggleText,
                  { transform: [{ translateX: textTranslateX }], color: isEV ? 'white' : '#007BFF' },
                ]}
              >
                EV
              </Animated.Text>
            </TouchableOpacity> */}
          
        </View>

        {/* Promo Banner */}
        <View style={styles.bannerWrapper}>
          <Image
            source={require('../../assets/userHomeScreen/image.png')}
            style={styles.bannerImage}
          />
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>What are you looking for?</Text>

        {/* Service Options */}
        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCardLarge}>
            <Image
              source={require('../../assets/userHomeScreen/image.png')}
              style={styles.serviceImage}
            />
            <Text style={styles.serviceText}>Emergency{"\n"}Road Asst</Text>
          </TouchableOpacity>

          <View style={styles.serviceRow}>
            <TouchableOpacity style={styles.serviceCardSmall}>
              <Image
                source={require('../../assets/userHomeScreen/Group 25652.png')}
                style={styles.serviceImage}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCardSmall}>
              <Image
                source={require('../../assets/userHomeScreen/Group 25653.png')}
                style={styles.serviceImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <RequestStatusRedirectButton/>

      {/* Bottom Navigation */}
      <UserBottomNavigator />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  userNameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    height: 30,
    borderRadius: 20,
    paddingHorizontal: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  activeToggle: {
    backgroundColor: '#0D7552',
  },
  inactiveToggle: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007BFF',
    position: 'absolute',
    left: 5,
  },
  toggleText: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    marginRight: 8,
  },
  bannerWrapper: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 25,
    marginLeft: 20,
    marginBottom: 10,
  },
  servicesGrid: {
    paddingHorizontal: 20,
  },
  serviceCardLarge: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: "black",
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  serviceCardSmall: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: "black",
  },
  serviceImage: {
    width: '100%',
    height: 140,
  },
  serviceText: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  plusButton: {
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  plusText: {
    fontSize: 42,
    color: '#fff',
    fontWeight: "bold",
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
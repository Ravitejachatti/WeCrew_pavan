import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../constants/constants";

const MasterBottomNavigator = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Define active color and inactive color
  const activeColor = '#007BFF';
  const inactiveColor = '#999';

  return (
    <View style={styles.container}>
      <View style={styles.bottomBar}>
        {/* Home Button */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("MasterHomeScreen")}
        >
          <Icon
            name="home"
            size={24}
            color={route.name === "MasterHomeScreen" ? activeColor : inactiveColor}
          />
          <Text style={[styles.navText, { color: route.name === "MasterHomeScreen" ? activeColor : inactiveColor }]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("MasterProfileScreen")}
        >
          <Icon
            name="person-outline"
            size={24}
            color={route.name === "MasterProfileScreen" ? activeColor : inactiveColor}
          />
          <Text style={[styles.navText, { color: route.name === "MasterProfileScreen" ? activeColor : inactiveColor }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  plusButtonContainer: {
    position: 'absolute',
    top: -30, // Moves it upwards, adjust if needed
    left: '50%', // Positions it at the center relative to the bottom bar
    transform: [{ translateX: -35 }], 
    alignSelf: 'center',
    backgroundColor: '#A9C0FF',
    borderRadius: 40,
  },
  plusButton: {
    backgroundColor: '#007BFF',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
});

export default MasterBottomNavigator;

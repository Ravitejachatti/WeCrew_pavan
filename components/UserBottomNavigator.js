import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Keyboard,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SIZES, FONT_FAMILY, FONTS } from "../constants/constants";
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const UserBottomNavigator = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const activeRoute = route.name;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Detect current active route
  const isActive = (screenName) => activeRoute === screenName;

  // Keyboard event handling
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Animate bottom bar visibility
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isKeyboardVisible ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isKeyboardVisible]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.bottomBar}>
        {/* Home Button */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.replace('UserHome')}
          accessibilityLabel="Home"
          testID="nav-home"
        >
          <Icon
            name="home"
            size={24}
            color={isActive('UserHome') ? colors.primary : '#999'}
          />
          <Text style={[styles.navText, { color: isActive('UserHome') ? colors.primary : '#999' }]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Floating Plus Button */}
        <TouchableOpacity
          style={styles.plusButtonContainer}
          onPress={() => navigation.navigate('UserRepairRequestScreen')}
          accessibilityLabel="Add Repair Request"
          testID="nav-plus"
        >
          <View style={[styles.plusButton, { backgroundColor: colors.primary }]}>
            <Icon name="add" size={32} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.replace('UserProfileScreen')}
          accessibilityLabel="Profile"
          testID="nav-profile"
        >
          <Icon
            name="person-outline"
            size={24}
            color={isActive('ProfileScreen') ? colors.primary : '#999'}
          />
          <Text style={[styles.navText, { color: isActive('ProfileScreen') ? colors.primary : '#999' }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
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
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  plusButtonContainer: {
    position: 'absolute',
    top: -35,
    left: width / 2 - 35,
    zIndex: 10,
  },
  plusButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
});

export default UserBottomNavigator;
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Image,
  StyleSheet,
} from 'react-native';

const FuelEVToggle = ({ onToggle }) => {
  const [isEV, setIsEV] = useState(false);
  const translateX = useRef(new Animated.Value(2)).current;
  const borderColor = useRef(new Animated.Value(0)).current; // 0 = fuel, 1 = ev

  const toggleSwitch = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isEV ? 2 : 40,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(borderColor, {
        toValue: isEV ? 0 : 1,
        duration: 250,
        useNativeDriver: true, // color animation must be JS-driven
      }),
    ]).start();

    setIsEV(!isEV);
    onToggle?.(!isEV);
  };

  const interpolatedBorderColor = borderColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#007BFF', '#28a745'], // blue → green
  });

  const interpolatedThumbColor = borderColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#007BFF', '#28a745'], // blue → green
  });

  const iconSource = isEV
    ? require('../../assets/icons8-electric-50.png')
    : require("../../assets/icons8-gas-station-50.png");

  return (
    <TouchableOpacity onPress={toggleSwitch}>
      <Animated.View style={[styles.toggleContainer, { borderColor: interpolatedBorderColor }]}>
        <Animated.View style={[styles.circle, {
          transform: [{ translateX }],
          backgroundColor: interpolatedThumbColor,
        }]}>
          <Image source={iconSource} style={styles.circleIcon} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    width: 80,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: 'absolute',
     // aligns center vertically ( (36 - 30) / 2 )
    left: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  circleIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },

});

export default FuelEVToggle;
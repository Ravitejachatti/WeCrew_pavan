import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const OnOffToggle = ({ isOn, onToggle }) => {
  const [animation] = useState(new Animated.Value(isOn ? 1 : 0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOn ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false,
    }).start();
  }, [isOn]);

  // Interpolating the circle's horizontal position
  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 52], // Adjust these values according to container width
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(!isOn)}
      style={[
        styles.toggleContainer,
        { backgroundColor: isOn ? '#007bff' : '#ccc' },
      ]}
    >
      {/* Texts */}
      <View style={styles.textContainer}>
        <Text style={[styles.text, isOn && styles.activeText]}>ON DUTY</Text>
        <Text style={[styles.text, !isOn && styles.activeText]}>OFF DUTY</Text>
      </View>

      {/* Circle thumb */}
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ translateX }],
            backgroundColor: isOn ? '#fff' : '#fff',
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    width: 100,
    height: 36,
    borderRadius: 18,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  text: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  activeText: {
    color: '#fff',
    fontWeight: '700',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
    top: 2,
    // left: 2 will be handled by translateX animation
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default OnOffToggle;

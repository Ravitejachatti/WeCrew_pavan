import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - 80;
const SLIDER_WIDTH = 50;
const RIGHT_MARGIN = 10;

const SlideToConfirm = ({
  onSlideComplete,
  text = "Slide to Confirm",
  sliderColor = "#fff",
  trackColor = "#006241",
  textColor = "#fff",
  direction = "right",
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [confirmed, setConfirmed] = useState(false);

  const isRight = direction === 'right';
  const maxSlide = SLIDE_WIDTH - SLIDER_WIDTH - RIGHT_MARGIN;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !confirmed,
      onPanResponderMove: (_, gesture) => {
        const moveX = isRight ? gesture.dx : -gesture.dx;
        if (moveX >= 0 && moveX <= maxSlide) {
          pan.setValue(isRight ? gesture.dx : -gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const dx = isRight ? gesture.dx : -gesture.dx;
        if (dx > maxSlide - 10) {
          Animated.timing(pan, {
            toValue: maxSlide,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setConfirmed(true);
            onSlideComplete(true);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Position slider based on direction
  const animatedStyle = {
    transform: [{ translateX: isRight ? pan : Animated.multiply(pan, -1) }],
    left: isRight ? 0 : undefined,
    right: isRight ? undefined : 0,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Text style={[styles.trackText, { color: textColor }]}>{text}</Text>

        {isRight ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color="rgba(255,255,255,0.5)"
            style={styles.arrowIcon}
          />
        ) : (
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color="rgba(255,255,255,0.5)"
            style={styles.leftArrowIcon}
          />
        )}

        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.slider, { backgroundColor: sliderColor }, animatedStyle]}
        >
          <MaterialCommunityIcons
            name={isRight ? "chevron-double-right" : "chevron-double-left"}
            size={30}
            color={trackColor}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  track: {
    marginTop: 10,
    width: SLIDE_WIDTH,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  trackText: {
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
  },
  arrowIcon: {
    position: 'absolute',
    right: 20,
    alignItems:'center',
    // top: 10,
  },
  leftArrowIcon: {
    position: 'absolute',
    left: 20,
    alignItems:'center',
    // top: 10,
  },
  slider: {
    position: 'absolute',
    width: SLIDER_WIDTH,
    height: 35,
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default SlideToConfirm;

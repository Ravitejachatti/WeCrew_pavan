import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 40;
const THUMB_WIDTH = 60;

const SwipeSliderButton = ({
  direction = 'right',
  onSwipeComplete,
  text = 'Accept Repair',
  color = '#006400', // default to green
}) => {
  const translateX = useSharedValue(0);
  const isRight = direction === 'right';

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      const translation = isRight ? event.translationX : -event.translationX;
      if (translation >= 0 && translation <= SLIDER_WIDTH - THUMB_WIDTH) {
        translateX.value = isRight ? event.translationX : -event.translationX;
      }
    },
    onEnd: () => {
      const endThreshold = SLIDER_WIDTH - THUMB_WIDTH - 20;
      const isComplete = translateX.value > endThreshold;

      if (isComplete) {
        translateX.value = withSpring(isRight ? SLIDER_WIDTH - THUMB_WIDTH : -(SLIDER_WIDTH - THUMB_WIDTH));
        runOnJS(onSwipeComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: color }]}>
        {!isRight && (
          <Ionicons
            name="chevron-back"
            size={20}
            color="#fff"
            style={styles.leftArrow}
          />
        )}
        <Text style={styles.label}>{text}</Text>
        {isRight && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#fff"
            style={styles.rightArrow}
          />
        )}
      </View>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.thumb, animatedStyle]}>
          <Ionicons
            name={isRight ? 'chevron-forward-outline' : 'chevron-back-outline'}
            size={24}
            color={color}
          />
          <Ionicons
            name={isRight ? 'chevron-forward-outline' : 'chevron-back-outline'}
            size={24}
            color={color}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  leftArrow: {
    position: 'absolute',
    left: 15,
    top: 17,
  },
  rightArrow: {
    position: 'absolute',
    right: 15,
    top: 17,
  },
  thumb: {
    width: THUMB_WIDTH,
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default SwipeSliderButton;

import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const LoadingBars = ({ color = '#3498db', size = 40 }) => {
  const bars = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];

  useEffect(() => {
    const animate = (bar, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 0.3,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    bars.forEach((bar, index) => animate(bar, index * 150));
  }, [bars]);

  return (
    <View style={[styles.container, { height: size, gap: size * 0.25 }]}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              width: size * 0.2,
              height: size,
              backgroundColor: color,
              transform: [{ scaleY: bar }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 4,
  },
});

export default LoadingBars;
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';
import SplashScreenNative from 'react-native-splash-screen';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    SplashScreenNative.hide(); // hide native splash
  }, []);

  const handleEnd = () => {
    navigation.replace('Home'); // or your main screen
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/splashVideo.mp4')}
        style={styles.backgroundVideo}
        resizeMode="cover"
        onEnd={handleEnd}
        muted
        repeat={false}
        fullscreen={true}
        playInBackground={false}
        playWhenInactive={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fallback background
  },
  backgroundVideo: {
    width,
    height,
  },
});

export default SplashScreen;
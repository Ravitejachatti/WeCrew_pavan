import messaging from '@react-native-firebase/messaging';

export async function requestFCMPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ FCM Permission granted');
    } else {
      console.log('❌ FCM Permission denied');
    }
  } catch (error) {
    console.error('🚫 Error requesting FCM permission:', error);
  }
}

export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('✅ FCM Token:', token);
    return token;
  } catch (error) {
    console.error('🚫 Error getting FCM token:', error);
    return null;
  }
}
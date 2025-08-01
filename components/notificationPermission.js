import { PermissionsAndroid, Platform } from 'react-native';

export async function requestAndroidNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: "Notification Permission",
        message: "We need permission to send you important alerts and updates.",
        buttonPositive: "Allow",
      }
    );

    console.log('🔐 Notification permission status:', granted);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // Not needed below Android 13
}

// export this function to use

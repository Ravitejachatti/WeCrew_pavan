// src/utils/permissions.js
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestLocationPermissions() {
  if (Platform.OS === 'android') {
    const fine = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    const background = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
    );

    return fine === 'granted' && background === 'granted';
  }
  return true; // iOS auto-asks on use
}
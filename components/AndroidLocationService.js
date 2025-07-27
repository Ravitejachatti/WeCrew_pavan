// services/AndroidLocationService.js
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { BackgroundLocationModule, LocationPermissionHelper } = NativeModules;

class AndroidLocationService {
  constructor() {
    this.locationEmitter = null;
    this.locationSubscription = null;

    if (Platform.OS === 'android' && BackgroundLocationModule) {
      this.locationEmitter = new NativeEventEmitter(BackgroundLocationModule);
    }
  }

  // Check if all required permissions are granted
  async checkPermissions() {
    try {
      if (Platform.OS !== 'android' || !LocationPermissionHelper) {
        throw new Error('Android location permissions not available');
      }

      const permissions = await LocationPermissionHelper.checkPermissions();
      return permissions;
    } catch (error) {
      console.error('Error checking permissions:', error);
      throw error;
    }
  }

  // Request location permissions
  async requestPermissions() {
    try {
      if (Platform.OS !== 'android' || !LocationPermissionHelper) {
        throw new Error('Android location permissions not available');
      }

      const result = await LocationPermissionHelper.requestPermissions();
      return result;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      throw error;
    }
  }

  // Start background location service
  async startLocationService(options = {}) {
    try {
      if (Platform.OS !== 'android' || !BackgroundLocationModule) {
        throw new Error('Android background location service not available');
      }

      const serviceOptions = {
        taskTitle: options.taskTitle || 'Location Tracking Active',
        taskDesc: options.taskDesc || 'Tracking your location while on duty',
        ...options,
      };

      const result = await BackgroundLocationModule.startLocationService(serviceOptions);
      console.log('Location service started:', result);
      return result;
    } catch (error) {
      console.error('Error starting location service:', error);
      throw error;
    }
  }

  // Stop background location service
  async stopLocationService() {
    try {
      if (Platform.OS !== 'android' || !BackgroundLocationModule) {
        throw new Error('Android background location service not available');
      }

      const result = await BackgroundLocationModule.stopLocationService();
      console.log('Location service stopped:', result);
      return result;
    } catch (error) {
      console.error('Error stopping location service:', error);
      throw error;
    }
  }

  // Check if location service is running
  async isLocationServiceRunning() {
    try {
      if (Platform.OS !== 'android' || !BackgroundLocationModule) {
        return false;
      }

      return await BackgroundLocationModule.isLocationServiceRunning();
    } catch (error) {
      console.error('Error checking service status:', error);
      return false;
    }
  }

  // Subscribe to location updates
  subscribeToLocationUpdates(callback) {
    if (!this.locationEmitter) {
      console.warn('Location emitter not available');
      return () => {};
    }

    this.locationSubscription = this.locationEmitter.addListener(
      'onLocationUpdate',
      (location) => {
        if (callback && typeof callback === 'function') {
          callback(location);
        }
      }
    );

    return () => {
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }
    };
  }

  // Unsubscribe manually if needed
  unsubscribeFromLocationUpdates() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }
}

export default new AndroidLocationService();
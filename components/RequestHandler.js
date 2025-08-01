import { NativeModules, NativeEventEmitter, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class RequestManager {
  constructor() {
    this.isModalVisible = false;
    this.currentRequest = null;
    
    // Listen for request events from native Android
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for incoming request events
    DeviceEventEmitter.addListener('SHOW_REQUEST_MODAL', (requestData) => {
      this.handleIncomingRequest(requestData);
    });

    // Listen for modal dismiss events
    DeviceEventEmitter.addListener('DISMISS_MODAL', () => {
      this.dismissModal();
    });

    // Listen for app state changes
    DeviceEventEmitter.addListener('APP_STATE_CHANGE', (state) => {
      this.handleAppStateChange(state);
    });
  }

  handleIncomingRequest(requestData) {
    console.log('Incoming request:', requestData);
    
    // Store the request data
    this.currentRequest = requestData;
    
    // Check if modal is already visible
    if (this.isModalVisible) {
      // Replace current request with new one
      this.dismissModal();
      setTimeout(() => {
        this.showModal(requestData);
      }, 100);
    } else {
      this.showModal(requestData);
    }
  }

  showModal(requestData) {
    this.isModalVisible = true;
    this.currentRequest = requestData;
    
    // Trigger modal display in React Native
    DeviceEventEmitter.emit('DISPLAY_REQUEST_MODAL', requestData);
  }

  dismissModal() {
    this.isModalVisible = false;
    this.currentRequest = null;
    
    // Hide modal in React Native
    DeviceEventEmitter.emit('HIDE_REQUEST_MODAL');
  }

  handleAppStateChange(state) {
    if (state === 'active' && this.currentRequest) {
      // App came to foreground with pending request
      this.showModal(this.currentRequest);
    }
  }

  // Method to accept request
  async acceptRequest(requestData) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(userData);
      const masterId = parsedData?._id;

      if (!masterId || !requestData?.requestId) {
        throw new Error('Master ID or Request ID is missing');
      }

      // Make API call to accept request
      const response = await fetch(`${API}/request/${requestData.requestId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ masterId }),
      });

      if (response.ok) {
        // Store accepted request
        await AsyncStorage.setItem('AcceptedRequest', JSON.stringify(requestData));
        
        // Dismiss modal
        this.dismissModal();
        
        // Navigate to accepted screen
        DeviceEventEmitter.emit('NAVIGATE_TO_ACCEPTED', requestData);
        
        return { success: true };
      } else {
        throw new Error('Failed to assign request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      return { success: false, error: error.message };
    }
  }

  // Method to reject request
  async rejectRequest(requestData) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(userData);
      const masterId = parsedData?._id;

      if (!masterId || !requestData?.requestId) {
        throw new Error('Master ID or Request ID is missing');
      }

      // Make API call to reject request
      const response = await fetch(`${API}/request/${requestData.requestId}/cancelled-master`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/JSON',
        },
        body: JSON.stringify({ masterId }),
      });

      if (response.ok) {
        // Dismiss modal
        this.dismissModal();
        return { success: true };
      } else {
        throw new Error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current request
  getCurrentRequest() {
    return this.currentRequest;
  }

  // Check if modal is visible
  getModalVisibility() {
    return this.isModalVisible;
  }
}

export default new RequestManager();
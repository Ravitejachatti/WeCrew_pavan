import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  BackHandler
} from 'react-native';
import Sound from 'react-native-sound';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CustomRepairNotification = ({ 
  visible, 
  requestData, 
  onAccept, 
  onCancel, 
  onMiss,
  onClose 
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [sound, setSound] = useState(null);
  const navigation = useNavigation();
  const timerRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Initialize custom sound
      const customSound = new Sound('notification_sound.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }
        // Play the sound on repeat
        customSound.setNumberOfLoops(-1); // Infinite loop
        customSound.play();
        soundRef.current = customSound;
      });

      // Start 30-second timer
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleMiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Handle hardware back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        return true; // Prevent default back action
      });

      return () => {
        clearInterval(timerRef.current);
        backHandler.remove();
        if (soundRef.current) {
          soundRef.current.stop();
          soundRef.current.release();
        }
      };
    }
  }, [visible]);

  const stopSoundAndTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
    }
  };

  const handleAccept = async () => {
    stopSoundAndTimer();
    try {
      await onAccept(requestData);
      onClose();
      // Navigate to Master Home Screen
      navigation.navigate('MasterHomeScreen');
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleCancel = async () => {
    stopSoundAndTimer();
    try {
      await onCancel(requestData);
      onClose();
    } catch (error) {
      console.error('Error canceling request:', error);
      Alert.alert('Error', 'Failed to cancel request');
    }
  };

  const handleMiss = async () => {
    stopSoundAndTimer();
    try {
      await onMiss(requestData);
      onClose();
    } catch (error) {
      console.error('Error handling missed request:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {}} // Prevent closing with back button
    >
      <View style={styles.overlay}>
        <View style={styles.notificationContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>New Repair Request</Text>
            <View style={styles.timerContainer}>
              <Text style={styles.timer}>{timeLeft}s</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.customerName}>
              Customer: {requestData?.customerName || 'Unknown'}
            </Text>
            <Text style={styles.location}>
              Location: {requestData?.location || 'Not specified'}
            </Text>
            <Text style={styles.vehicleInfo}>
              Vehicle: {requestData?.vehicleBrand} {requestData?.vehicleModel}
            </Text>
            <Text style={styles.issue}>
              Issue: {requestData?.issueDescription || 'General repair'}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(timeLeft / 30) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: width * 0.9,
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timer: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    marginBottom: 20,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  issue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
});

export default CustomRepairNotification;
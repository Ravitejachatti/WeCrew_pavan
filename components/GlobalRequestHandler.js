import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { useRequest } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import MasterGettingRequest from '../pages/masterScreens/MasterGettingRequest';
import { useNavigation } from '@react-navigation/native';

const GlobalRequestHandler = () => {
  const { user } = useAuth();
  const { incomingRequest, requestVisible, hideRequest } = useRequest();
  const navigation = useNavigation();

  // Only show for masters
  if (user?.role !== 'master' || !requestVisible || !incomingRequest) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={requestVisible}
      animationType="slide"
      onRequestClose={hideRequest}
    >
      <MasterGettingRequest
        request={incomingRequest}
        onDismiss={hideRequest}
        navigation={navigation}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GlobalRequestHandler;
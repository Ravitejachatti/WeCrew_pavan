import React,{  useEffect, useState } from 'react';
import { Modal } from 'react-native';

import { useRequest } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import MasterGettingRequest from '../pages/masterScreens/MasterGettingRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';


const GlobalRequestHandler = () => {
  const { user } = useAuth();

  const { incomingRequest, requestVisible, modalPersistent, hideRequest } = useRequest();
  const navigation = useNavigation();

  // ✅ Add debugging
  console.log('🔍 GlobalRequestHandler Debug:', {
    userRole: user?.role,
    hasIncomingRequest: !!incomingRequest,
    requestId: incomingRequest?.requestId,
    requestVisible,
    modalPersistent,
  });
  console.log(user)
    // Only show modal if requestVisible is true
  const shouldShowModal = requestVisible && incomingRequest && user?.role === 'master';

  if (!shouldShowModal) return null;
  

 

  return (
    <Modal
      transparent
      visible={shouldShowModal}
      animationType="slide"
      onRequestClose={hideRequest}
    >
      <MasterGettingRequest
        navigation={navigation}
        // Component uses useRequest() context internally
      />
    </Modal>
  );
};

export default GlobalRequestHandler;
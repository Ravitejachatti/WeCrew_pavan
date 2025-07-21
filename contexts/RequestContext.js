import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const RequestContext = createContext();

export const useRequest = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
};

export const RequestProvider = ({ children }) => {
  const { user } = useAuth();
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [requestVisible, setRequestVisible] = useState(false);

  useEffect(() => {
    if (user?.role === 'master' && user._id) {
      checkDutyStatus();
      if (isOnDuty) {
        listenForRequests();
      }
    }

    return () => {
      if (user?.role === 'master' && user._id) {
        stopListeningForRequests();
      }
    };
  }, [user, isOnDuty]);

  const checkDutyStatus = async () => {
    try {
      const dutyStatus = await AsyncStorage.getItem('isOnDuty');
      setIsOnDuty(dutyStatus === 'true');
    } catch (error) {
      console.error('Error checking duty status:', error);
    }
  };

  const listenForRequests = () => {
    if (!user?._id) return;

    const db = getDatabase();
    const masterReqRef = ref(db, `masterRequests/${user._id}`);
    
    const handleRequest = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Extract the actual request object if wrapped in a key
        const actualRequest = typeof data === "object" && !Array.isArray(data) && Object.keys(data).length === 1
          ? Object.values(data)[0]
          : data;
        
        setIncomingRequest(actualRequest);
        setRequestVisible(true);
      } else {
        setIncomingRequest(null);
        setRequestVisible(false);
      }
    };

    onValue(masterReqRef, handleRequest);
  };

  const stopListeningForRequests = () => {
    if (!user?._id) return;
    
    const db = getDatabase();
    const masterReqRef = ref(db, `masterRequests/${user._id}`);
    off(masterReqRef);
  };

  const updateDutyStatus = async (status) => {
    try {
      await AsyncStorage.setItem('isOnDuty', status ? 'true' : 'false');
      setIsOnDuty(status);
      
      if (status) {
        listenForRequests();
      } else {
        stopListeningForRequests();
        setIncomingRequest(null);
        setRequestVisible(false);
      }
    } catch (error) {
      console.error('Error updating duty status:', error);
    }
  };

  const hideRequest = () => {
    setRequestVisible(false);
  };

  const showRequest = () => {
    if (incomingRequest) {
      setRequestVisible(true);
    }
  };

  const value = {
    incomingRequest,
    requestVisible,
    isOnDuty,
    updateDutyStatus,
    hideRequest,
    showRequest,
    listenForRequests,
    stopListeningForRequests
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};
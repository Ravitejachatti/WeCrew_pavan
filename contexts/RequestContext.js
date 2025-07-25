import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';
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

  const handleRequest = async (snapshot) => {
    const data = snapshot.val();
    console.log("Incoming request data:", data);

    if (data) {
      const firstKey = Object.keys(data)[0];
      const actualRequest = data[firstKey]; // Extract the actual request object
      const requestId = actualRequest?.requestId;
      console.log("Extracted request ID:", requestId);

      if (!requestId) {
        setIncomingRequest(null);
        setRequestVisible(false);
        return;
      }

      // 🔍 Check ongoing request
      const ongoingRef = ref(db, `ongoingMasters/${requestId}`);
      try {
        const ongoingSnap = await get(ongoingRef);

        if (ongoingSnap.exists()) {
          const ongoingData = ongoingSnap.val();
          const status = ongoingData?.status;
          console.log("✅ Ongoing request found:", ongoingData);

          // ⏳ Optional: If you want to store it for UI:
          // setOngoingRequestData(ongoingData);

          if (["assigned", "in_progress", "completed"].includes(status)) {
            console.log("⚠️ Request already ongoing or completed, skipping modal.");
            setIncomingRequest(null);
            setRequestVisible(false);
            return;
          }
        } else {
          console.log("❌ No ongoing request found for this ID.");
        }
      } catch (err) {
        console.error("🔥 Error fetching ongoingMasters data:", err);
      }

      // ✅ Valid new request
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
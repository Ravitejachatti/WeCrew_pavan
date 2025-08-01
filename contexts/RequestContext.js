import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
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
  const [requestVisible, setRequestVisible] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [modalPersistent, setModalPersistent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  let countdownInterval = useRef(null);

  const lastRequestIdRef = useRef(null);

  useEffect(() => {
    console.log('🔄 RequestContext State Changed:', {
      incomingRequest: !!incomingRequest,
      requestId: incomingRequest?.requestId,
      requestVisible,
      modalPersistent,
      isOnDuty,
      userRole: user?.role,
      userId: user?._id
    });
  }, [incomingRequest, requestVisible, modalPersistent, isOnDuty, user?.role, user?._id]);

  useEffect(() => {
    checkDutyStatus();
  }, []);

  // useEffect(() => {
  //   const checkPendingFCMRequest = async () => {
  //     try {
  //       let pendingRequest = await AsyncStorage.getItem('pendingFCMRequest');
  //       if (!pendingRequest) {
  //         pendingRequest = await AsyncStorage.getItem('pendingRepairRequest');
  //       }
  //       if (pendingRequest && user?.role === 'master') {
  //         const requestData = JSON.parse(pendingRequest);
  //         console.log('🔄 Restoring pending FCM request:', requestData);
  //         if (requestData.requestId && lastRequestIdRef.current !== requestData.requestId) {
  //           lastRequestIdRef.current = requestData.requestId;
  //           setIncomingRequest(requestData);
  //           setRequestVisible(true);
  //           setModalPersistent(true);
  //         }
  //         await AsyncStorage.removeItem('pendingFCMRequest');
  //         await AsyncStorage.removeItem('pendingRepairRequest');
  //       }
  //     } catch (error) {
  //       console.error('Error checking pending FCM request:', error);
  //     }
  //   };
  //   if (user && user.role === 'master') {
  //     checkPendingFCMRequest();
  //   }
  // }, [user?.role, user?._id]);

  useEffect(() => {
    let timeoutId;
    if (modalPersistent && incomingRequest) {
      timeoutId = setTimeout(() => {
        console.log('⏰ Auto-dismissing persistent modal after timeout');
        hideRequest();
      }, 30000); // Updated to 30 seconds
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [modalPersistent, incomingRequest]);

  useEffect(() => {
    if (requestVisible) {
      setCountdown(30);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      countdownInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownInterval.current);
    }
    return () => clearInterval(countdownInterval.current);
  }, [requestVisible]);

  const checkDutyStatus = async () => {
    try {
      const dutyStatus = await AsyncStorage.getItem('isOnDuty');
      setIsOnDuty(dutyStatus === 'true');
    } catch (error) {
      console.error('Error checking duty status:', error);
    }
  };

  const updateDutyStatus = async (status) => {
    try {
      await AsyncStorage.setItem('isOnDuty', status ? 'true' : 'false');
      setIsOnDuty(status);
      if (status) {
        listenForOngoingRequests();
      } else {
        stopListeningForRequests();
        clearRequest();
      }
    } catch (error) {
      console.error('Error updating duty status:', error);
    }
  };

  const listenForOngoingRequests = () => {
    if (!user?._id) return;
    const db = getDatabase();
    const masterReqRef = ref(db, `masterRequests/${user._id}`);
    const handleOngoingRequest = async (snapshot) => {
      const data = snapshot.val();
      console.log('📨 Ongoing Firebase request data:', data);
      if (data) {
        const firstKey = Object.keys(data)[0];
        const actualRequest = data[firstKey];
        const requestId = actualRequest?.requestId;
        if (!requestId) return;
        console.log('📋 Ongoing request detected:', actualRequest);
      }
    };
    onValue(masterReqRef, handleOngoingRequest);
  };

  const stopListeningForRequests = () => {
    if (!user?._id) return;
    const db = getDatabase();
    const masterReqRef = ref(db, `masterRequests/${user._id}`);
    off(masterReqRef);
  };

  const showRequest = async (requestData) => {
    console.log('🚨 showRequest called with:', requestData);
    if (!requestData?.requestId) {
      console.warn('❌ No requestId in FCM data');
      return;
    }
    if (lastRequestIdRef.current === requestData.requestId) {
      console.log('⛔ Duplicate FCM request ignored:', requestData.requestId);
      return;
    }
    lastRequestIdRef.current = requestData.requestId;
    try {
      await AsyncStorage.setItem('pendingFCMRequest', JSON.stringify(requestData));
      console.log('💾 FCM request stored in AsyncStorage');
    } catch (error) {
      console.error('Error storing pending FCM request:', error);
    }
    console.log('✅ Setting FCM request state');
    setIncomingRequest(requestData);
    setRequestVisible(true);
    setModalPersistent(true);
  };

  const hideRequest = async () => {
    console.log('🙈 Hiding request');
    setRequestVisible(false);
    setModalPersistent(false);
    setIncomingRequest(null);
    lastRequestIdRef.current = null;
    try {
      await AsyncStorage.removeItem('pendingFCMRequest');
      await AsyncStorage.removeItem('pendingRepairRequest');
    } catch (error) {
      console.error('Error clearing pending FCM request:', error);
    }
  };

  const clearRequest = async () => {
    console.log('🧹 Clearing request');
    setIncomingRequest(null);
    setRequestVisible(false);
    setModalPersistent(false);
    lastRequestIdRef.current = null;
    try {
      await AsyncStorage.removeItem('pendingFCMRequest');
      await AsyncStorage.removeItem('pendingRepairRequest');
    } catch (error) {
      console.error('Error clearing pending FCM request:', error);
    }
  };

  const hasActiveRequest = () => {
    return !!incomingRequest && (requestVisible || modalPersistent);
  };

  return (
    <RequestContext.Provider
      value={{
        incomingRequest,
        requestVisible,
        isOnDuty,
        modalPersistent,
        countdown,
        showRequest,
        hideRequest,
        clearRequest,
        hasActiveRequest,
        updateDutyStatus,
        listenForOngoingRequests,
        stopListeningForRequests,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
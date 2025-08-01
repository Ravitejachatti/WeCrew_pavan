// hooks/useFirebaseRequestListener.js
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { useRequest } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';

export const useFirebaseRequestListener = () => {
  const { showRequest } = useRequest();
  const { user } = useAuth();

  useEffect(() => {
    console.log('🎧 Setting up FCM listeners for user:', user?.role);

    // ✅ FOREGROUND: App is open and active
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('🟢 FCM Foreground Message:', remoteMessage);
      
      if (user?.role === 'master' && remoteMessage?.data?.type === 'repair_request') {
        console.log('🚨 Showing foreground FCM request');
        showRequest(remoteMessage.data);
      }
    });

    // ✅ BACKGROUND: App is backgrounded, user taps notification
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🟡 FCM Background Message (tap):', remoteMessage);
      
      if (user?.role === 'master' && remoteMessage?.data?.type === 'repair_request') {
        console.log('🚨 Showing background FCM request');
        showRequest(remoteMessage.data);
      }
    });

    // ✅ COLD START: App was killed, user taps notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('❄️ FCM Cold Start Message:', remoteMessage);
          
          if (user?.role === 'master' && remoteMessage?.data?.type === 'repair_request') {
            console.log('🚨 Showing cold start FCM request');
            showRequest(remoteMessage.data);
          }
        }
      });

    return () => {
      console.log('🔇 Cleaning up FCM listeners');
      unsubscribeForeground();
      unsubscribeBackground?.();
    };
  }, [user?.role, showRequest]);
};
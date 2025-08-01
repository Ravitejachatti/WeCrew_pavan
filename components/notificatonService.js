// utils/NotificationService.js
import PushNotification from 'react-native-push-notification';

export const configureNotificationActions = () => {
  PushNotification.configure({
    onAction: function (notification) {
      console.log("ACTION:", notification.action);
      if (notification.action === 'Accept') {
        global.pendingRepairData = { ...notification.userInfo, action: 'accept' };
      } else if (notification.action === 'Reject') {
        global.pendingRepairData = { ...notification.userInfo, action: 'reject' };
      }
    },
    popInitialNotification: true,
    requestPermissions: true,
  });
};

export const showLocalRepairNotification = (data) => {
  PushNotification.localNotification({
    channelId: 'fcm-channel',
    title: 'New Repair Request',
    message: `${data.customerName} - ${data.issueDescription}`,
    actions: ['Accept', 'Reject'],
    playSound: true,
    soundName: 'notification_sound.mp3',
    userInfo: data,
  });
};
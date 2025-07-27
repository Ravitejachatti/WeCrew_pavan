import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { Alert } from 'react-native';






messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  Alert.alert('Background Request', remoteMessage.notification?.body);
  // You can trigger a local notification here
  // here alert is not coming when app is in background notifcation should come
  // give the code for that
  

  
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

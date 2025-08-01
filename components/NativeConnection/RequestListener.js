import { useEffect } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { useRequest } from '../../contexts/RequestContext';

const { RequestModalModule } = NativeModules;

export const useNativeRequestListener = () => {
  const { showRequest } = useRequest();

  useEffect(() => {
    const emitter = new NativeEventEmitter(RequestModalModule);
    const sub = emitter.addListener("SHOW_REQUEST_MODAL", (data) => {
      console.log("📨 Native FCM received:", data);
      showRequest(data); // Triggers modal
    });

    return () => sub.remove();
  }, []);
};
// getAllAsyncStorageData.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAllAsyncStorageData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    const allData = stores.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
    console.log('📦 All AsyncStorage Data:', allData);
    return allData;
  } catch (error) {
    console.error('❌ Error getting AsyncStorage data:', error);
    return null;
  }
};
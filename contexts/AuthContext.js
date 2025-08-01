import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllAsyncStorageData } from '../pages/testing/asyncStorage';
import { NativeModules, Platform } from 'react-native';
import { API } from '../constants/constants';
import messaging from '@react-native-firebase/messaging';
import axios from "axios";
const { BackgroundLocationModule, SoundControlModule } = NativeModules;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    console.log("Checking auth state...");
    getAllAsyncStorageData() 
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('userData');
      const userDataTemp = await AsyncStorage.getItem('userDataTemp');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else if (userDataTemp) {
        const parsedUser = JSON.parse(userDataTemp);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setAuthLoading(true);
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      const userString = await AsyncStorage.getItem('userData');
      const user = userString ? JSON.parse(userString) : null;

      if (user?.role === 'master') {
        if (Platform.OS === 'android' && BackgroundLocationModule?.stopLocationService) {
          await BackgroundLocationModule.stopLocationService();
        }
        if (SoundControlModule?.stopSound) {
          SoundControlModule.stopSound();
        }
      }

      await messaging().deleteToken();
      if (user?._id && user?.role) {
        await axios.post(`${API}/notification/deletefcmtoken`, {
          userId: user._id,
          role: user.role,
        });
      }

      await AsyncStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout completed for role:', user?.role);
    } catch (err) {
      console.error('❌ Logout failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const updateUser = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,          // initial load
    authLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
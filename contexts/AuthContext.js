import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    console.log("Checking auth state...");
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const userDataTemp = await AsyncStorage.getItem('userDataTemp');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("Found userData in AsyncStorage", parsedUser);
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
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userData',
        'userDataTemp',
        'UserVehicleDetails',
        'UserRepairRequestResponse',
        'MasterAssignedToRequest',
        'AcceptedRequest',
        'MasterAnalytics',
        'isOnDuty'
      ]);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

const updateUser = async (userData) => {
  setUser(userData);
  await AsyncStorage.setItem('userData', JSON.stringify(userData));
};

  const value = {
    user,
    loading,
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
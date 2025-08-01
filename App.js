import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RequestProvider } from './contexts/RequestContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import GlobalRequestHandler from './components/GlobalRequestHandler';

import { AuthNavigator } from './pages/navigation/AuthNavigator';
import  UserOnboardingNavigator  from './pages/navigation/OnBoardingNavigator'
import { UserNavigator } from './pages/navigation/UserNavigator';
import { MasterNavigator } from './pages/navigation/MasterNavigator';

const AppContent = () => {
  const { user, onboardingCompleted } = useAuth();




  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {!user ? (
          <AuthNavigator />
        ) : user.role === 'master' ? (
          <MasterNavigator />
        ) : (
          <UserNavigator />
        )}
        <GlobalRequestHandler />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RequestProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </RequestProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
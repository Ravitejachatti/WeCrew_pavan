import React, { createContext, useContext, useRef } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const navigationRef = useRef();

  const navigate = (name, params) => {
    if (navigationRef.current) {
      navigationRef.current.navigate(name, params);
    }
  };

  const goBack = () => {
    if (navigationRef.current) {
      navigationRef.current.goBack();
    }
  };

  const reset = (state) => {
    if (navigationRef.current) {
      navigationRef.current.reset(state);
    }
  };

  const getCurrentRoute = () => {
    if (navigationRef.current) {
      return navigationRef.current.getCurrentRoute();
    }
    return null;
  };

  const value = {
    navigationRef,
    navigate,
    goBack,
    reset,
    getCurrentRoute
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
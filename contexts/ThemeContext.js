import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Theme Context
const ThemeContext = createContext();

// Theme configurations
const THEMES = {
  fuel: {
    primary: "#007AFF",
    secondary: "#ffffff",
    background: "#fefefe",
    text: "#666",
    textDark: "#000",
    textLight: "#888",
    border: "#eee",
    toggleActive: "#007AFF",
    toggleInactive: "#ffffff",
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
  },
  ev: {
    primary: "#0D7552",
    secondary: "#ffffff", 
    background: "#fefefe",
    text: "#666",
    textDark: "#000",
    textLight: "#888",
    border: "#eee",
    toggleActive: "#0D7552",
    toggleInactive: "#ffffff",
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
  }
};

// Service images for different modes
const SERVICE_IMAGES = {
  fuel: {
    emergencyRoadAssist: require("../assets/userHomeScreen/image.png"),
    service1: require("../assets/userHomeScreen/Group 25652.png"),
    service2: require("../assets/userHomeScreen/Group 25653.png"),
  },
  ev: {
    emergencyRoadAssist: require("../assets/userHomeScreen/image.png"), // You can replace with EV-specific image
    service1: require("../assets/userHomeScreen/Group 25652.png"), // You can replace with EV-specific image
    service2: require("../assets/userHomeScreen/Group 25653.png"), // You can replace with EV-specific image
  }
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("fuel"); // Default is Fuel mode
  const [colors, setColors] = useState(THEMES.fuel);
  const [serviceImages, setServiceImages] = useState(SERVICE_IMAGES.fuel);

  // Load theme from AsyncStorage on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('selectedTheme');
        if (savedTheme && (savedTheme === 'fuel' || savedTheme === 'ev')) {
          setTheme(savedTheme);
          setColors(THEMES[savedTheme]);
          setServiceImages(SERVICE_IMAGES[savedTheme]);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Toggle between Fuel and EV mode
  const toggleTheme = async (newTheme) => {
    try {
      const themeToSet = newTheme || (theme === "fuel" ? "ev" : "fuel");
      setTheme(themeToSet);
      setColors(THEMES[themeToSet]);
      setServiceImages(SERVICE_IMAGES[themeToSet]);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('selectedTheme', themeToSet);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Set theme based on vehicle type
  const setThemeBasedOnVehicle = async (isEV) => {
    const newTheme = isEV ? "ev" : "fuel";
    await toggleTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colors, 
      serviceImages,
      toggleTheme, 
      setThemeBasedOnVehicle,
      isEV: theme === "ev"
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook for easy access
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
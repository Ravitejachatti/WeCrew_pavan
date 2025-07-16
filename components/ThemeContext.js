import React, { createContext, useState, useContext } from "react";
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../constants/constants";

// Create Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("fuel"); // Default is Fuel mode

  // Toggle between Fuel and EV mode
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "fuel" ? "ev" : "fuel"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook for easy access
export const useTheme = () => useContext(ThemeContext);

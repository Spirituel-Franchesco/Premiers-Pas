import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const THEMES = {
  light: {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    subtext: '#777777',
    header: '#1a73e8',
    border: '#dddddd',
    primary: '#1a73e8',
  },
  dark: {
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    subtext: '#aaaaaa',
    header: '#1a1a2e',
    border: '#333333',
    primary: '#4a9eff',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem('app_theme');
    if (saved === 'dark') setIsDark(true);
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem('app_theme', newValue ? 'dark' : 'light');
  };

  const theme = isDark ? THEMES.dark : THEMES.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
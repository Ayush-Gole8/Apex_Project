import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check for saved theme preference or default to dark
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      }
    } catch (error) {
      console.error('Error reading theme preference:', error);
      // Default to dark theme if there's an error
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    // Save theme preference and apply to document
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      // Dark theme colors
      dark: {
        primary: 'from-dark-forest-800 via-dark-forest-700 to-dark-forest-800',
        secondary: 'from-emerald-custom-600 to-forest-700',
        text: 'text-white',
        textSecondary: 'text-white/90',
        textTertiary: 'text-white/70',
        background: 'bg-white/12',
        border: 'border-white/25',
        card: 'bg-white/12 backdrop-blur-lg border-white/25'
      },
      // Light theme colors
      light: {
        primary: 'from-gray-50 via-white to-gray-100',
        secondary: 'from-emerald-500 to-forest-600',
        text: 'text-gray-900',
        textSecondary: 'text-gray-800',
        textTertiary: 'text-gray-600',
        background: 'bg-white/90',
        border: 'border-gray-200',
        card: 'bg-white/90 backdrop-blur-lg border-gray-200'
      }
    }
  };

  const currentTheme = isDark ? theme.colors.dark : theme.colors.light;

  return (
    <ThemeContext.Provider value={{ ...theme, current: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
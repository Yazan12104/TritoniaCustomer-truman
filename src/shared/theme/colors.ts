import { useThemeStore } from '../store/themeStore';

export const lightColors = {
  primary: '#435816',    // Olive Green - Main brand
  secondary: '#2b3913',  // Dark Olive Green - secondary/hover states
  background: '#f2f2f2', // 95 Grayscale - Light clean background
  surface: '#ffffff',    // White for cards and containers
  text: '#170915',       // Dark text derived from CMYK
  textLight: '#6c757d',  // Gray for secondary text
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  border: '#e2e8f0',
  info: '#3498db',
};

export const darkColors = {
  primary: '#a2b378',    // Lighter Olive Green for dark mode
  secondary: '#435816',
  background: '#121212', // Standard Material Dark
  surface: '#1e1e1e',    // Surface for cards
  text: '#ffffff',
  textLight: '#adb5bd',
  textDimmer: '#020202',
  error: '#ff6b6b',
  success: '#51cf66',
  warning: '#fcc419',
  border: '#343a40',
  info: '#3498db',
};

// Original colors object for backward compatibility (defaults to light)
export const colors = lightColors;

export const useThemeColors = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  return {
    ...(isDarkMode ? darkColors : lightColors),
    isDark: isDarkMode
  };
};

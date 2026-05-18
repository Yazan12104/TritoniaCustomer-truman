import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { GlobalErrorOverlay } from "./src/core/components/GlobalErrorOverlay";
import { useThemeStore } from "./src/shared/store/themeStore";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useThemeColors } from "./src/shared/theme/colors";
import { useEffect } from "react";

export default function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = useThemeColors();

  useEffect(() => {
    if (Platform.OS === "android") {
      // Hide the Android navigation bar when the app opens
      NavigationBar.setVisibilityAsync("hidden");
      
      // Allow users to swipe from the edge to show it temporarily
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          style={isDarkMode ? "light" : "dark"}
          backgroundColor={colors.background}
        />
        <RootNavigator />
        <GlobalErrorOverlay />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

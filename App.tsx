import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { GlobalErrorOverlay } from "./src/core/components/GlobalErrorOverlay";
import { useThemeStore } from "./src/shared/store/themeStore";
import { useThemeColors } from "./src/shared/theme/colors";

export default function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const colors = useThemeColors();

  return (
    <NavigationContainer>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={colors.background}
      />
      <RootNavigator />
      <GlobalErrorOverlay />
    </NavigationContainer>
  );
}

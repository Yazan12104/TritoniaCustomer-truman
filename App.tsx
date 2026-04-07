import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { GlobalErrorOverlay } from "./src/core/components/GlobalErrorOverlay";

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
      <GlobalErrorOverlay />
    </NavigationContainer>
  );
}

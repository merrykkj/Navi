import { NavigationContainer } from "@react-navigation/native";

import { LoginProvider } from "./src/providers/loginProvider.js";
import { ThemeProvider } from "./src/providers/themeProvider.js"; // << ADICIONADO

import AppNavigator from "./navigation.js";

export default function App() {
  return (
    <LoginProvider>
      <ThemeProvider> 
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </LoginProvider>
  );
}

import { NavigationContainer } from "@react-navigation/native";

import { LoginProvider } from "./src/providers/loginProvider.js";

import AppNavigator from "./navigation.js";

export default function App() {
  return (
    <>
      <LoginProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </LoginProvider>
    </>
  );
}

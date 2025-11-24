//Importando bibliotecas
import { NavigationContainer } from "@react-navigation/native";

//Provider
import { LoginProvider } from "./src/providers/loginProvider.js";

//Importando as rotas
import { ForgotPassword } from "./src/app/account/forgot-password/forgot-password.js";
import Account from "./src/app/account/account.js";
import Main from "./src/app/screens/main/main.js";
import Historico from "./src/app/screens/main/HistoricoScreen.js";
import Settings from "./src/app/screens/settings/settings.js";
import Help from "./src/app/screens/help/help.js";
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

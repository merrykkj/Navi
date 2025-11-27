import { createStackNavigator } from "@react-navigation/stack";

// Importando as rotas
import { LoginForm } from "./src/app/account/index.js";
import { ForgotPassword, UpdatePassword } from "./src/app/account/forgot-password/forgot-password.js";
import Account from "./src/app/account/account.js";

import Main from "./src/app/screens/main/main.js";
import History from "./src/app/screens/history/history.js";
import Settings from "./src/app/screens/settings/settings.js";
import Help from "./src/app/screens/help/help.js";
import { Register } from "./src/app/account/register/register.js";

// Importando o Navegador
const Stack = createStackNavigator();

function AppNavigator() {

    return (
        <Stack.Navigator>
                <>
                    <Stack.Screen name="Login" component={LoginForm} />
                    <Stack.Screen name="Esqueci a senha" component={ForgotPassword} />
                    <Stack.Screen name="Atualizar a senha" component={UpdatePassword} />
                    <Stack.Screen name="Cadastre-se" component={Register} />
                    <Stack.Screen name="Página inicial" component={Main} />
                    <Stack.Screen name="Conta" component={Account} />
                    <Stack.Screen name="Histórico" component={History} />
                    <Stack.Screen name="Ajustes" component={Settings} />
                    <Stack.Screen name="Ajuda" component={Help} />
                </>
        </Stack.Navigator>
    );
}

export default AppNavigator;

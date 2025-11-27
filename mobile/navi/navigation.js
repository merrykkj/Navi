import { createStackNavigator } from "@react-navigation/stack";

import { LoginForm } from "./src/app/account/index.js";
import { ForgotPassword, UpdatePassword } from "./src/app/account/forgot-password/forgot-password.js";

import Main from "./src/app/screens/main/main.js";
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

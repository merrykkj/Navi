import { createStackNavigator } from "@react-navigation/stack";

import { LoginForm } from "./src/app/account/index.js";
import { ForgotPassword } from "./src/app/account/forgot-password/forgot-password.js";
import { Register } from "./src/app/account/register/register.js";

import Main from "./src/app/screens/main/main.js";

import { useLogin } from "./src/providers/loginProvider.js";

const Stack = createStackNavigator();

function AppNavigator() {
    const { user } = useLogin();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name="Main" component={Main} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginForm} />
                    <Stack.Screen name="Esqueci a senha" component={ForgotPassword} />
                    <Stack.Screen name="Cadastre-se" component={Register} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default AppNavigator;

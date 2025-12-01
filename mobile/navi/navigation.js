import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import { LoginForm } from "./src/app/account/index.js";
import { ForgotPassword, UpdatePassword } from "./src/app/account/forgot-password/forgot-password.js";

import Main from "./src/app/screens/main/main.js";
import Account from '../navi/src/app/account/account.js'
import History from "./src/app/screens/main/HistoricoScreen.js";
import Settings from "./src/app/screens/main/SettingsScreen.js";
import Help from "./src/app/screens/main/AjudaScreen.js";
import { Register } from "./src/app/account/register/register.js";

import { useLogin } from './src/providers/loginProvider.js'

// Importando o Navegador
const Stack = createStackNavigator();

function AppNavigator() {
    const { user, isLoading } = useLogin();
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FFD600" />
            </View>
        );
    }
    return (
        <Stack.Navigator>
            {user ? (
                <>
                    < Stack.Screen name="Página inicial" component={Main} />
                    <Stack.Screen name="Conta" component={Account} />
                    <Stack.Screen name="Histórico" component={History} />
                    <Stack.Screen name="Ajustes" component={Settings} />
                    <Stack.Screen name="Ajuda" component={Help} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginForm} />
                    <Stack.Screen name="Esqueci a senha" component={ForgotPassword} />
                    <Stack.Screen name="Atualizar a senha" component={UpdatePassword} />
                    <Stack.Screen name="Cadastre-se" component={Register} />
                </>
            )
            }
        </Stack.Navigator>
    );
}

export default AppNavigator;

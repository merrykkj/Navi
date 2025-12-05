import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const carregarUsuario = async () => {
            try {
                const dadosSalvos = await AsyncStorage.getItem('@meus_dados');
                const token = await AsyncStorage.getItem('token')
                if (dadosSalvos && token) {
                    const usuarioParseado = JSON.parse(dadosSalvos);
                    setUser({ ...usuarioParseado, token: token });
                    console.log("Usuário carregado:", { ...usuarioParseado, token });
                }
            } catch (error) {
                console.log('erro ao carregar', error);
            } finally {
                setIsLoading(false);
            }
        };
        carregarUsuario();
    }, []);

    useEffect(() => {
        const salvarUsuario = async () => {
            if (!user) return;

            try {
                await AsyncStorage.setItem('@meus_dados', JSON.stringify(user));
                if (user.token) {
                    await AsyncStorage.setItem('token', user.token);
                }
                console.log("Usuário salvo no AsyncStorage:", user);
            } catch (error) {
                console.log('erro ao salvar', error);
            }
        };
        salvarUsuario();
    }, [user]);

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('@meus_dados');
            await AsyncStorage.removeItem('token');
            setUser(null); // Ao setar null, o AppNavigator joga para a tela de Login
        } catch (error) {
            console.log('Erro no logout', error);
        }
    };


    return (
        <LoginContext.Provider value={{ user, setUser, isLoading, logout }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => useContext(LoginContext);
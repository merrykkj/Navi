import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const carregarUsuario = async () => {
            try {
                const dadosSalvos = await AsyncStorage.getItem('@meus_dados');
                if (dadosSalvos) {
                    setUser(JSON.parse(dadosSalvos));
                    console.log("Usuário carregado do AsyncStorage:", JSON.parse(dadosSalvos));
                }

            } catch (error) {
                console.log('erro ao carregar', error);
            } finally {
                // Avisa que terminou de carregar, tendo achado usuário ou não
                setIsLoading(false);
            }
        };
        carregarUsuario();
    }, []);

    useEffect(() => {
        const salvarUsuario = async () => {
            try {
                await AsyncStorage.setItem('@meus_dados', JSON.stringify(user));
                console.log("Usuário salvo no AsyncStorage:", user);
            } catch (error) {
                console.log('erro ao salvar', error);
            }
        };
        salvarUsuario();
    }, [user]);



    return (
        <LoginContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => useContext(LoginContext);
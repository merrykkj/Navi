import React, { useState } from 'react';
import { useLogin } from '../../providers/loginProvider.js';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import API_URL from '../../config/api.js';
import LoadingScreen from '../components/LoadingScreen.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LoginForm = ({ navigation }) => {
  const { setUser } = useLogin();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const apiUrlLogin = `${API_URL}/auth/login`;

  const handleSubmit = async () => {
    if (!email || !senha) {
      Alert.alert('Erro!', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const minLoadingTime = 6000;
    const startTime = Date.now();

    try {
      const response = await fetch(apiUrlLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(minLoadingTime - elapsed, 0);

      if (!response.ok) {
        setTimeout(() => setLoading(false), remaining);
        Alert.alert('Erro!', data.message);
        return;
      }
      await AsyncStorage.setItem("token", data.token);
      
      setUser(data.user);
      Alert.alert('Sucesso!', `${data.message}`);
      setTimeout(() => setLoading(false), remaining);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ImageBackground
      source={require('../../../assets/planodefundo.png')} // Substitua pelo caminho da sua imagem
      style={styles.wrapper}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontWeight: "bold", fontSize: 25 }}>Seja bem-vindo!</Text>
          <Text style={{ color: "#000000" }}>Faça login para continuar</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Endereço de Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={true}
        />

        <View style={{ paddingTop: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Esqueci a senha')}>
            <Text style={styles.links}>Esqueci a senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", paddingTop: 15, justifyContent: "center" }}>
          <Text style={{ color: '#000000' }}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastre-se')}>
            <Text style={styles.links}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: '90%',
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  links: {
    color: "#EAB308",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 12,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#EAB308",
  },
});

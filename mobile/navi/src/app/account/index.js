//useLogin
import { useLogin } from '../../providers/loginProvider';

//bibliotecas
import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// URL da API (se precisar, coloque sua URL real)
const apiUrl = "http://seu-backend.com/login";

// Formulário de login
export const LoginForm = ({ navigation }) => {
  const { setUser } = useLogin();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async () => {
    try {
      if (!email || !senha) {
        Alert.alert("Erro", "Preencha todos os campos!");
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Falha na autenticação");
      }

      Alert.alert("Login realizado", `Bem-vindo(a), ${data.user?.nome || "usuário"}`);
      setUser(data.user);

    } catch (error) {
      console.error(error);
      Alert.alert("Erro no Login", error.message || "Erro desconhecido.");
    }
  };

  return (
    <View style={styles.container}>
      
      {/* Cabeçalho */}
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", fontSize: 25 }}>Bem-vindo de volta</Text>
        <Text style={{ color: "#6e727a" }}>Faça login para continuar</Text>
      </View>

      {/* EMAIL */}
      <TextInput
        style={styles.input}
        placeholder="Endereço de Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* SENHA */}
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry={true}
      />

      {/* Esqueci a senha */}
      <View style={{ paddingTop: 10 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Esqueci a senha')}>
          <Text style={styles.links}>Esqueci a senha</Text>
        </TouchableOpacity>
      </View>

      {/* Botão de Login */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {/* Criar conta */}
      <View style={{ flexDirection: "row", paddingTop: 15, justifyContent: "center" }}>
        <Text>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cadastre-se')}>
          <Text style={styles.links}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

// ESTILOS
const styles = StyleSheet.create({
  container: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 20,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  links: {
    color: "#D08700",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#FFDE33",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#4E431B",
  },
});

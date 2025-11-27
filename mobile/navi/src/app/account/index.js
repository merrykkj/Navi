//useLogin
import { useLogin } from '../../providers/loginProvider.js'

//bibliotecas
import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// Formulário de login
export const LoginForm = ({ navigation }) => {
  const { setUser } = useLogin();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const apiUrlLogin = 'http://10.84.6.146:3002/auth/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !senha) {
        throw new Error('Preencha todos os campos!');
      }

      const response = await fetch(apiUrlLogin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha
        }),
      });
      //email teste: proprietario@email.com

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(data.mensagem, "Não enccontramos o usuario inserido" || 'Falha na autenticação');
      }

      setUser(data.user);

      Alert.alert('Login Realizado com sucesso!', `Bem-vindo, ${data.user.nome}!`);

    } catch (error) {
      console.error(error);
      Alert.alert('Erro no Login', error.message || 'Erro desconhecido.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", fontSize: 25 }}>Bem-vindo de volta</Text>
        <Text style={{ color: "#6e727a" }}>Faça login para continuar</Text>
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

      {/* Esqueci a senha */}
      <View style={{ paddingTop: 10 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Esqueci a senha')}>
          <Text style={styles.links}>Esqueci a senha</Text>
        </TouchableOpacity>
      </View>

      {/* Botao de login */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {/* cadastrar */}
      <View style={{ display: "flex", flexDirection: "row", paddingTop: 15 }}>
        <Text>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cadastre-se')}>
          <Text style={styles.links}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  links: {
    color: "#D08700",
    fontWeight: "bold",
  },
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

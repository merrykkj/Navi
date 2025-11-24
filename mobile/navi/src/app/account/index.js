//useLogin
import { useLogin } from '../../providers/loginProvider';

//bibliotecas
import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// Formulário de login (sem SQLite)
export const LoginForm = ({ navigation }) => {
  const { setUser } = useLogin();

  const [form, setForm] = useState({
    email: '',
    senha: ''
  });

  const handleSubmit = async () => {
    try {
      if (!form.email || !form.senha) {
        throw new Error('Preencha todos os campos!');
      }

      const fakeUser = {
        id_usuario: 1,
        nome: "Usuário Genérico",
        email: form.email,
        papel: "ADMINISTRADOR"
      };

      setUser(fakeUser);

      Alert.alert('Login fictício', `Bem-vindo, ${fakeUser.nome}!`);

      setForm({
        email: '',
        senha: ''
      });

      console.log("Login sem SQLite:", fakeUser);

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
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={form.senha}
        onChangeText={(text) => setForm({ ...form, senha: text })}
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

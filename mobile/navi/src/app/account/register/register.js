import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { sha256 } from 'js-sha256';
import * as SQLite from 'expo-sqlite';

export const Register = ({ navigation }) => {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.nome || !form.email || !form.senha) {
        Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
        return;
      }

      const db = await SQLite.openDatabaseAsync('navi.db');
      const senhaHasheada = sha256(form.senha);

      const newUser = await db.runAsync(
        'INSERT INTO usuario (nome, email, senha, telefone, papel) VALUES (?, ?, ?, ?, ?)',
        form.nome,
        form.email,
        senhaHasheada,
        form.telefone || null,
        "MOTORISTA"
      );

      if (newUser.changes > 0) {
        Alert.alert('Sucesso!', 'Usuário cadastrado com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }

    } catch (error) {
      if (error.message.includes("UNIQUE constraint failed: usuario.email")) {
        Alert.alert("Erro", "Este email já está cadastrado.");
      } else {
        Alert.alert("Erro ao cadastrar", error.message);
      }
    }
  };

  return (
    <LinearGradient
      colors={['#FFC300', '#f5e8bc', '#FFC300']}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardContainer}>

          <Image
            source={require('../../../../assets/navi-cinza.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Insira seus dados abaixo</Text>

          <View style={styles.inputGroup}>
            <Feather name="user" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#95A5A6"
              value={form.nome}
              onChangeText={(v) => handleChange('nome', v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Feather name="mail" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#95A5A6"
              value={form.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(v) => handleChange('email', v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Feather name="lock" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#95A5A6"
              secureTextEntry={!showPassword}
              value={form.senha}
              onChangeText={(v) => handleChange('senha', v)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#7F8C8D"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Feather name="phone" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.input}
              placeholder="Telefone (opcional)"
              placeholderTextColor="#95A5A6"
              value={form.telefone}
              onChangeText={(v) => handleChange('telefone', v)}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Cadastrar</Text>
            <Feather name="arrow-right" size={20} color="#fff" style={{ marginLeft: 5 }} />
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: "#7F8C8D" }}>Já possui conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}> Entrar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: 80,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  cardContainer: {
    width: "100%",
    maxWidth: 380,
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },

  logo: {
    width: 100,
    height: 90,
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    fontWeight: "800",
    fontSize: 26,
    color: "#2C3E50",
    textAlign: "center",
  },

  subtitle: {
    color: "#7F8C8D",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F9F9F9",
    width: "100%",
  },

  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 10,
  },

  button: {
    flexDirection: "row",
    backgroundColor: "#EAB308",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    width: "100%",
    marginTop: 10,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  footerLink: {
    color: "#EAB308",
    fontWeight: "700",
  },
});

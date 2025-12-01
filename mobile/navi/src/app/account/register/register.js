import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { sha256 } from 'js-sha256';
import * as SQLite from 'expo-sqlite';

export const Register = ({ navigation }) => {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: ''
  });

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
      console.error("ERRO AO CADASTRAR:", error);

      if (error.message.includes("UNIQUE constraint failed: usuario.email")) {
        Alert.alert("Erro", "Este email já está cadastrado.");
      } else {
        Alert.alert("Erro ao cadastrar", error.message);
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>

        {/* Cabeçalho */}
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para continuar</Text>
        </View>

        {/* Nome */}
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={form.nome}
          onChangeText={(v) => handleChange('nome', v)}
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(v) => handleChange('email', v)}
        />

        {/* Senha */}
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={form.senha}
          onChangeText={(v) => handleChange('senha', v)}
        />

        {/* Telefone */}
        <TextInput
          style={styles.input}
          placeholder="Telefone (opcional)"
          value={form.telefone}
          onChangeText={(v) => handleChange('telefone', v)}
        />

        {/* Botão */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        {/* Já tem conta */}
        <View style={{ flexDirection: "row", marginTop: 15, justifyContent: "center" }}>
          <Text>Já possui conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.links}>Entrar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  container: {
    width: "90%",
    padding: 20,
  },

  title: {
    fontWeight: "bold",
    fontSize: 25,
  },

  subtitle: {
    color: "#6e727a",
  },

  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 25,
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
    marginTop: 20,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#4E431B",
  },

  links: {
    color: "#D08700",
    fontWeight: "bold",
  },
});

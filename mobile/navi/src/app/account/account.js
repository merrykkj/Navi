// src/app/account/account.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from "expo-sqlite";
import { useLogin } from "../../providers/loginProvider";

// === Abre o banco ===
const openDb = async () => {
  return await SQLite.openDatabaseAsync("navi.db");
};

export default function Account() {
  const { user, setUser } = useLogin();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    papel: "",
    url_foto_perfil: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        papel: user.papel || "",
        url_foto_perfil: user.url_foto_perfil || ""
      });
    }
  }, [user]);

  async function handleSave() {
    try {
      const db = await openDb();
      await db.runAsync(
        `UPDATE usuario
         SET nome = ?, email = ?, telefone = ?, papel = ?, url_foto_perfil = ?
         WHERE id_usuario = ?`,
        [
          form.nome.trim(),
          form.email.trim(),
          form.telefone.trim(),
          form.papel.trim(),
          form.url_foto_perfil.trim(),
          user.id_usuario,
        ]
      );

      const updatedUser = await db.getFirstAsync(
        "SELECT * FROM usuario WHERE id_usuario = ?",
        [user.id_usuario]
      );
      setUser(updatedUser);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  }

  function handleLogout() {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          setUser(null);
        },
      },
    ]);
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: "#fff" }}>Nenhum usuário logado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Image
            source={
              form.url_foto_perfil
              ? {uri: form.url_foto_perfil}
              : require('../../../public/icon.png')
            }
            style={styles.avatar}
          />
          <View>
            <Text style={styles.nome}>{form.nome}</Text>
            <Text style={styles.papel}>{form.papel}</Text>
          </View>
        </View>

        {/* Campos */}
        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={form.nome}
            onChangeText={(t) => setForm({ ...form, nome: t })}
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            value={form.telefone}
            onChangeText={(t) => setForm({ ...form, telefone: t })}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Papel</Text>
          <TextInput
            value={form.papel}
            onChangeText={(t) => setForm({ ...form, papel: t })}
            style={styles.input}
            placeholder="ADMINISTRADOR | PROPRIETARIO | MOTORISTA"
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0c",
  },
  scroll: {
    padding: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: "#0b0b0c",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: "#222",
  },
  nome: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
  },
  papel: {
    fontSize: 14,
    color: "#FFDE33",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#222",
  },
  label: {
    color: "#bfbfbf",
    fontSize: 12,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#0f0f10",
    color: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#262626",
  },
  saveButton: {
    backgroundColor: "#FFDE33",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  saveText: {
    color: "#111",
    fontWeight: "700",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

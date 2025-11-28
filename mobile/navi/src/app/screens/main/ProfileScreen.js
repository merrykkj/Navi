import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogin } from "../../../providers/loginProvider";

export default function ProfileScreen() {
  const { user, setUser } = useLogin();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    papel: "",
    url_foto_perfil: "",
  });

  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        papel: user.papel || "",
        url_foto_perfil: user.url_foto_perfil || "",
      });
    }
  }, [user]);

  function handleSave() {
    if (!user) {
      Alert.alert("Erro", "Usuário não identificado para salvar as alterações.");
      return;
    }

    // Cria um objeto com os dados atualizados
    // Mantém o ID e outros dados antigos do usuário, sobrescrevendo com o formulário novo
    const updatedUser = {
      ...user,
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      papel: form.papel.trim(),
      url_foto_perfil: form.url_foto_perfil.trim(),
    };

    // Atualiza o estado global da aplicação
    setUser(updatedUser);
    
    Alert.alert("Sucesso", "Perfil atualizado com sucesso! (Apenas localmente na sessão)");
  }

  function handleLogout() {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => setUser(null) },
    ]);
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: "#000" }}>Nenhum usuário logado.</Text>
      </SafeAreaView>
    );
  }

  const StyledInput = ({ label, value, onChangeText, keyboardType, autoCapitalize, placeholder, name }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, focusedInput === name && styles.inputFocused]}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholder={placeholder}
        placeholderTextColor="#A9A9A9"
        onFocus={() => setFocusedInput(name)}
        onBlur={() => setFocusedInput(null)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerCard}>
          <Image
            source={
              form.url_foto_perfil
                ? { uri: form.url_foto_perfil }
                : require("../../../../public/icon.png")
            }
            style={styles.avatar}
          />

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{form.nome || "Usuário"}</Text>
            <Text style={styles.userRole}>{form.papel || "Sem Função"}</Text>
          </View>
        </View>
        
        <View style={styles.editCard}>
          <Text style={styles.sectionTitle}>Detalhes do Perfil</Text>
          
          <StyledInput
            name="nome"
            label="Nome Completo"
            value={form.nome}
            onChangeText={(t) => setForm({ ...form, nome: t })}
          />

          <StyledInput
            name="email"
            label="Email"
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <StyledInput
            name="telefone"
            label="Telefone"
            value={form.telefone}
            onChangeText={(t) => setForm({ ...form, telefone: t })}
            keyboardType="phone-pad"
          />

          <StyledInput
            name="papel"
            label="Papel / Função"
            value={form.papel}
            onChangeText={(t) => setForm({ ...form, papel: t })}
            placeholder="ADMINISTRADOR | PROPRIETARIO | MOTORISTA"
            autoCapitalize="characters"
          />

          <StyledInput
            name="url_foto_perfil"
            label="URL da Foto de Perfil"
            value={form.url_foto_perfil}
            onChangeText={(t) => setForm({ ...form, url_foto_perfil: t })}
            placeholder="Ex: https://example.com/foto.jpg"
            autoCapitalize="none"
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
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 18,
    borderColor: "#FFC107", 
    borderWidth: 4, 
    backgroundColor: "#EEE",
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#222",
    lineHeight: 30,
  },

  userRole: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777",
    marginTop: 3,
  },

  editCard: {
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 8,
  },

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#333",
    transitionProperty: 'border-color', 
    transitionDuration: 200,
  },
  
  inputFocused: {
    borderColor: "#FFC107",
    backgroundColor: "#FFF",
  },

  saveButton: {
    marginTop: 30,
    backgroundColor: "#FFC107",
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },

  saveText: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 18,
    color: "#222",
  },

  logoutButton: {
    marginTop: 15,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#C8C8C8",
  },

  logoutText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    color: "#777",
  },
});
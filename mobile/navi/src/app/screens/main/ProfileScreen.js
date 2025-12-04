import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLogin } from "../../../providers/loginProvider";
import styles, { COLORS } from './ProfileStyle';
import API_URL from "../../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const InfoRow = ({ label, value, field, updateFn, iconName, editando, keyboardType = 'default' }) => {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={iconName} size={20} color={COLORS.primaryDark} style={styles.icon} />
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        {editando ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => updateFn(field, text)}
            keyboardType={keyboardType}
          />
        ) : (
          <Text style={styles.value}>{value || 'Não informado'}</Text>
        )}
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { user, setUser } = useLogin();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiUrlUser = `${API_URL}/profile`;
  const apiUrlVeiculo = `${API_URL}/veiculo`;
  // Estado único para controlar o formulário e a exibição
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    plano: "",
    url_foto_perfil: "",
    anoEntrada: "",
    veiculo: {
      modelo: "",
      placa: "",
      cor: ""
    }
  });

  useEffect(() => {
    const fetchVeiculo = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(apiUrlVeiculo, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log("Resposta do servidor:", response.status, errorText);
          throw new Error("Erro ao exibir veículo");
        }

        const data = await response.json();

        setForm(prevForm => ({
          ...prevForm,
          veiculo: {
            modelo: data.modelo || "",
            placa: data.placa || "",
            cor: data.cor || ""
          }
        }));
      } catch (error) {
        console.error("Erro ao exibir veículo:", error);
      }
    }
    
    fetchVeiculo();
  }, [])

  // Carrega os dados do user do contexto para o estado local
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(apiUrlUser, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.log("Resposta do servidor:", response.status, errorText);
          throw new Error("Erro ao exibir perfil");
        }
        const data = await response.json();
        setForm(prev => ({
          ...prev,
          nome: data.nome || "",
          email: data.email || "",
          telefone: data.telefone || "",
          plano: data.plano || "",
          url_foto_perfil: data.url_foto_perfil || "",
          anoEntrada: new Date(data.data_criacao).getFullYear(),
        })
        )

      } catch (error) {
        console.error("Erro ao exibir perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  // Função para atualizar campos simples (nome, telefone, etc)
  const atualizarCampo = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  // Função para atualizar campos aninhados (veiculo)
  const atualizarVeiculo = (campo, valor) => {
    setForm(prev => ({
      ...prev,
      veiculo: {
        ...prev.veiculo,
        [campo]: valor
      }
    }));
  };

  async function handleSalvar() {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(apiUrlUser, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
        })
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      Alert.alert("Sucesso!", "Perfil atualizado.");

      setUser(prev => ({ ...prev, ...form }));
      setEditando(false);

    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o perfil");
    }
  }


  // const updatedUser = {
  //   ...user,
  //   ...form // Sobrescreve os dados do user com os dados do form
  // };

  // setUser(updatedUser);
  // setEditando(false);
  // Alert.alert("Sucesso", "Perfil atualizado com sucesso!");


  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem('token')
          setUser(null)
        }
      }
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text>Nenhum usuário logado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: form.url_foto_perfil }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.photoEditButton}>
              <Feather name="camera" size={18} color={'white'} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfo}>
            {editando ? (
              <TextInput
                style={styles.inputNameEdit}
                value={form.nome}
                onChangeText={(t) => atualizarCampo('nome', t)}
                placeholderTextColor={COLORS.textLight}
              />
            ) : (
              <Text style={styles.name}>{form.nome}</Text>
            )}

            <View style={styles.roleRow}>
              <MaterialIcons name="access-time" size={14} color={COLORS.textMedium} />
              <Text style={styles.role}>Cliente desde {form.anoEntrada}</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* DADOS DE CONTATO */}
        <Text style={styles.sectionTitle}>Dados de Contato e Plano</Text>
        <View style={styles.box}>
          <InfoRow
            label="Telefone"
            value={form.telefone}
            field="telefone"
            updateFn={atualizarCampo}
            iconName="call-outline"
            keyboardType="phone-pad"
            editando={editando}
          />
          <InfoRow
            label="Email"
            value={form.email}
            field="email"
            updateFn={atualizarCampo}
            iconName="mail-outline"
            keyboardType="email-address"
            editando={editando}
          />
          <InfoRow
            label="Plano"
            value={form.plano}
            field="plano"
            updateFn={atualizarCampo}
            iconName="receipt-outline"
            editando={editando}
          />
        </View>

        <View style={styles.separator} />

        {/* VEÍCULO */}
        <Text style={styles.sectionTitle}>Detalhes do Veículo</Text>
        <View style={styles.box}>
          <InfoRow
            label="Modelo"
            value={form.veiculo.modelo}
            field="modelo"
            updateFn={atualizarVeiculo}
            iconName="car-outline"
            editando={editando}
          />
          <InfoRow
            label="Placa"
            value={form.veiculo.placa}
            field="placa"
            updateFn={atualizarVeiculo}
            iconName="pricetag-outline"
            editando={editando}
          />
          <InfoRow
            label="Cor"
            value={form.veiculo.cor}
            field="cor"
            updateFn={atualizarVeiculo}
            iconName="color-filter-outline"
            editando={editando}
          />
        </View>

        {/* BOTÕES */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => (editando ? handleSalvar() : setEditando(true))}
          >
            <Text style={styles.buttonPrimaryText}>
              {editando ? 'Salvar Alterações' : 'Editar Perfil'}
            </Text>
            <Ionicons
              name={editando ? 'save-outline' : 'create-outline'}
              size={18}
              color={'white'}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>

          {editando && (
            <TouchableOpacity style={styles.buttonCancel} onPress={() => setEditando(false)}>
              <Text style={styles.buttonCancelText}>Cancelar Edição</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.buttonCancel, { marginTop: 20 }]} onPress={handleLogout}>
            <Text style={styles.buttonCancelText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}
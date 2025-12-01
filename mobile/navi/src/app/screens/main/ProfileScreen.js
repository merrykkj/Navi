import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogin } from "../../../providers/loginProvider";

export default function ProfileScreen() {
  const { user, setUser } = useLogin();
  const [cliente, setCliente] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (user) {
      setCliente({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        anoEntrada: user.anoEntrada || '',
        plano: user.plano || '',
        foto: user.url_foto_perfil || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop&crop=faces',
        veiculo: {
          modelo: user.veiculo?.modelo || '',
          placa: user.veiculo?.placa || '',
          cor: user.veiculo?.cor || '',
        },
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

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => setUser(null) }
    ]);
  };

  if (!cliente) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Nenhum usuário logado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>

        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: cliente.foto }} style={styles.avatar} />
            <TouchableOpacity style={styles.photoEditButton}>
              <Feather name="camera" size={18} color={'white'} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerInfo}>
            {editando ? (
              <TextInput
                style={styles.inputNameEdit}
                value={cliente.nome}
                onChangeText={(t) => atualizarCampo('nome', t)}
                placeholderTextColor={COLORS.textLight}
              />
            ) : (
              <Text style={styles.name}>{cliente.nome}</Text>
            )}
            <View style={styles.roleRow}>
              <MaterialIcons name="access-time" size={14} color={COLORS.textMedium} />
              <Text style={styles.role}>Cliente desde {cliente.anoEntrada || 'Não informado'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Dados de Contato e Plano</Text>
        <View style={styles.box}>
          <InfoRow label="Telefone" value={cliente.telefone} field="telefone" updateFn={atualizarCampo} iconName="call-outline" keyboardType="phone-pad" editando={editando} />
          <InfoRow label="Email" value={cliente.email} field="email" updateFn={atualizarCampo} iconName="mail-outline" keyboardType="email-address" editando={editando} />
          <InfoRow label="Plano" value={cliente.plano} field="plano" updateFn={atualizarCampo} iconName="receipt-outline" editando={editando} />
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Detalhes do Veículo</Text>
        <View style={styles.box}>
          <InfoRow label="Modelo" value={cliente.veiculo.modelo} field="modelo" updateFn={atualizarVeiculo} iconName="car-outline" editando={editando} />
          <InfoRow label="Placa" value={cliente.veiculo.placa} field="placa" updateFn={atualizarVeiculo} iconName="pricetag-outline" editando={editando} />
          <InfoRow label="Cor" value={cliente.veiculo.cor} field="cor" updateFn={atualizarVeiculo} iconName="color-filter-outline" editando={editando} />
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={() => (editando ? handleSalvar() : setEditando(true))}>
            <Text style={styles.buttonPrimaryText}>{editando ? 'Salvar Alterações' : 'Editar Perfil'}</Text>
            <Ionicons name={editando ? 'save-outline' : 'create-outline'} size={18} color={'white'} style={{ marginLeft: 8 }} />
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

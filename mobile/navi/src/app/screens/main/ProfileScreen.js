import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons'; 
import { useLogin } from '../../../providers/loginProvider';
import * as SQLite from 'expo-sqlite';

const windowWidth = Dimensions.get('window').width;
const FOOTER_CLEARANCE = 120;

const COLORS = {
  primary: '#FFD700',
  primaryDark: '#EAB308',
  textDark: '#333333',
  textMedium: '#666666',
  textLight: '#999999',
  background: '#FFFBEA',
  cardBackground: '#FFFFFF',
  border: '#E0E0E0',
  separator: '#EBEBEB',
  inputBackground: '#FFFFFF',
};

const openDb = () => SQLite.openDatabase("navi.db");

const InfoRow = ({ label, value, field, updateFn, iconName, editando, keyboardType = 'default' }) => (
  <View style={styles.infoRow}>
    <Ionicons name={iconName} size={20} color={COLORS.primaryDark} style={styles.icon} />
    <View style={styles.infoContent}>
      <Text style={styles.label}>{label}</Text>
      {editando ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(t) => updateFn(field, t)}
          keyboardType={keyboardType}
          placeholder={`Insira o ${label.toLowerCase()}`}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          placeholderTextColor={COLORS.textLight} 
        />
      ) : (
        <Text style={styles.value}>{value || 'Não informado'}</Text>
      )}
    </View>
  </View>
);

export default function PerfilClienteEstacionamento() {
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

  const atualizarCampo = (campo, valor) => setCliente({ ...cliente, [campo]: valor });
  const atualizarVeiculo = (campo, valor) => setCliente({ ...cliente, veiculo: { ...cliente.veiculo, [campo]: valor } });

  const handleSalvar = async () => {
    if (!user) return;

    try {
      const db = openDb();
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE usuario SET nome = ?, email = ?, telefone = ?, url_foto_perfil = ? WHERE id_usuario = ?`,
          [cliente.nome, cliente.email, cliente.telefone, cliente.foto, user.id_usuario],
          (_, result) => {
            setUser({ ...user, nome: cliente.nome, email: cliente.email, telefone: cliente.telefone, url_foto_perfil: cliente.foto });
            Alert.alert('Sucesso', 'Perfil atualizado!');
            setEditando(false);
          },
          (_, error) => { console.log(error); Alert.alert('Erro', 'Não foi possível salvar.'); return false; }
        );
      });
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

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
          <InfoRow
            label="Telefone"
            value={cliente.telefone}
            field="telefone"
            updateFn={atualizarCampo}
            iconName="call-outline"
            keyboardType="phone-pad"
            editando={editando}
          />
          <InfoRow
            label="Email"
            value={cliente.email}
            field="email"
            updateFn={atualizarCampo}
            iconName="mail-outline"
            keyboardType="email-address"
            editando={editando}
          />
          <InfoRow
            label="Plano"
            value={cliente.plano}
            field="plano"
            updateFn={atualizarCampo}
            iconName="receipt-outline"
            editando={editando}
          />
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Detalhes do Veículo</Text>
        <View style={styles.box}>
          <InfoRow
            label="Modelo"
            value={cliente.veiculo.modelo}
            field="modelo"
            updateFn={atualizarVeiculo}
            iconName="car-outline"
            editando={editando}
          />
          <InfoRow
            label="Placa"
            value={cliente.veiculo.placa}
            field="placa"
            updateFn={atualizarVeiculo}
            iconName="pricetag-outline"
            editando={editando}
          />
          <InfoRow
            label="Cor"
            value={cliente.veiculo.cor}
            field="cor"
            updateFn={atualizarVeiculo}
            iconName="color-filter-outline"
            editando={editando}
          />
        </View>

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
            <TouchableOpacity
              style={styles.buttonCancel} 
              onPress={() => setEditando(false)}
            >
              <Text style={styles.buttonCancelText}>Cancelar Edição</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.buttonCancel, { marginTop: 20 }]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonCancelText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingTop: 24, 
    paddingBottom: FOOTER_CLEARANCE, 
    alignItems: 'center', 
    backgroundColor: COLORS.background, 
  },

  card: {
    width: Math.min(windowWidth - 32, 700),
    padding: 24,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },

  separator: {
    height: 1, 
    backgroundColor: COLORS.separator,
    marginVertical: 25, 
    width: '100%',
  },

  header: { alignItems: 'center', marginBottom: 30, paddingTop: 10 },
  
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 3, 
    borderColor: COLORS.border, 
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#EAB308', 
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: COLORS.cardBackground, 
  },
  
  headerInfo: { alignItems: 'center' },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.textDark },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  role: { fontSize: 14, color: COLORS.textMedium, marginLeft: 6 },
  
  inputNameEdit: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 2,
    textAlign: 'center',
    marginBottom: 4,
  },

  sectionTitle: { marginTop: 24, marginBottom: 10, fontSize: 18, fontWeight: '700', color: COLORS.textDark },

  box: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  icon: { marginRight: 12 },
  infoContent: { flex: 1 },

  label: { fontSize: 12, color: COLORS.textMedium },
  value: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginTop: 2 },

  input: {
    backgroundColor: COLORS.inputBackground, 
    borderWidth: 1,
    borderColor: COLORS.border, 
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    fontSize: 16,
    color: COLORS.textDark,
  },

  actionButtonsContainer: { 
    alignItems: 'center',
    marginTop: 30,
  },
  
  buttonPrimary: {
    backgroundColor: COLORS.primaryDark, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.primaryDark, 
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonPrimaryText: { color: 'white', fontWeight: '700', fontSize: 16 },
  
  buttonCancel: {
    marginTop: 15,
    padding: 5,
  },
  buttonCancelText: { 
    color: COLORS.textMedium, 
    fontWeight: '600', 
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

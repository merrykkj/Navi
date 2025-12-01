import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './SettingsStyle';

const Icons = {
  account: 'A',
  notification: '!',
  help: '?',
  info: 'i',
  chevron: '›',
};

const SettingItem = ({ icon, label, detail = '', onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>

    <View style={styles.itemRight}>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      <Text style={styles.chevron}>{Icons.chevron}</Text>
    </View>
  </TouchableOpacity>
);

const SettingToggle = ({ icon, label, isEnabled, toggleSwitch }) => (
  <View style={styles.item}>
    <View style={styles.itemLeft}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>

    <Switch
      trackColor={{ false: "#d0d0d0", true: "#FFC72C" }}
      thumbColor="#fff"
      onValueChange={toggleSwitch}
      value={isEnabled}
    />
  </View>
);

export default function SettingsScreen({ onNavigate }) {
  const navigation = useNavigation();
  const [isPushEnabled, setIsPushEnabled] = useState(true);

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Gerencie sua conta e preferências do aplicativo.</Text>
      </View>

      <Text style={styles.sectionTitle}>GERAL</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.item} onPress={() => onNavigate("profile")}>
          <View style={styles.itemLeft}>
            <Text style={styles.icon}>{Icons.account}</Text>
            <Text style={styles.label}>Editar Perfil</Text>
          </View>

          <View style={styles.itemRight}>
            <Text style={styles.chevron}>{Icons.chevron}</Text>
          </View>
        </TouchableOpacity>

        <SettingItem
          icon={Icons.notification}
          label="Mudar Senha"
          onPress={() => navigation.navigate("ChangePassword")}
        />
      </View>

      <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
      <View style={styles.section}>
        <SettingToggle
          icon={Icons.notification}
          label="Receber Notificações"
          isEnabled={isPushEnabled}
          toggleSwitch={() => setIsPushEnabled(prev => !prev)}
        />
      </View>

      <Text style={styles.sectionTitle}>SUPORTE</Text>
      <View style={styles.section}>
        <SettingItem icon={Icons.help} label="Ajuda e FAQ" onPress={() => navigation.navigate("Help")} />
        <SettingItem icon={Icons.info} label="Política de Privacidade" onPress={() => navigation.navigate("Privacy")} />

        <View style={[styles.item, { borderBottomWidth: 0 }]}>
          <Text style={styles.label}>Versão do Aplicativo</Text>
          <Text style={styles.detail}>1.0.0</Text>
        </View>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

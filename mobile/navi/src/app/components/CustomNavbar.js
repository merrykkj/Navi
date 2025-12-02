import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLogin } from "../../providers/loginProvider"; 

const PRIMARY_COLOR = '#EAB308';

export default function CustomNavbar({ toggleSidebar }) {
  const { user } = useLogin();

  const handleNotificationPress = () => {
    console.log('Botão de Notificação Pressionado');
  };

  return (
    <View style={styles.navbarContainer}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      <View style={styles.navbar}>

        <View style={styles.leftIconsContainer}>
          <TouchableOpacity 
            onPress={toggleSidebar} 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleNotificationPress} 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 15,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 10,
  },

  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  leftIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  greetingText: {
    color: 'white',
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  iconButton: {
    padding: 6,
    marginRight: 5,
    borderRadius: 12,
  },
});

import React, { useState } from 'react';
import { useLogin } from '../../providers/loginProvider.js';
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
import API_URL from '../../config/api.js';
import LoadingScreen from '../components/LoadingScreen.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

export const LoginForm = ({ navigation }) => {
  const { setUser } = useLogin();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const apiUrlLogin = `${API_URL}/auth/login`;

  const handleSubmit = async () => {
    if (!email || !senha) {
      Alert.alert('Erro!', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const minLoadingTime = 6000;
    const startTime = Date.now();

    try {
      const response = await fetch(apiUrlLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(minLoadingTime - elapsed, 0);

      if (!response.ok) {
        setTimeout(() => setLoading(false), remaining);
        Alert.alert('Erro!', data.message);
        return;
      }

      await AsyncStorage.setItem("token", data.token);
      setUser(data.user);

      setTimeout(() => setLoading(false), remaining);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <LinearGradient
      colors={['#FFC300', '#f5e8bc', '#FFC300']}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardContainer}>

          <Image
            source={require('../../../assets/navi-cinza.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.header}>
            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Estacione em segundos</Text>
          </View>

          {/* Features alinhadas sem quebrar */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Feather name="map-pin" size={18} color="#EAB308" />
              <Text style={styles.featureText}>Vagas próximas</Text>
            </View>

            <View style={styles.featureItem}>
              <Feather name="clock" size={18} color="#EAB308" />
              <Text style={styles.featureText}>Agendamentos</Text>
            </View>


          </View>

          <View style={styles.inputGroup}>
            <Feather name="mail" size={20} color="#7F8C8D" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Endereço de Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#95A5A6"
            />
          </View>

          <View style={styles.inputGroup}>
            <Feather name="lock" size={20} color="#7F8C8D" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showPassword}
              placeholderTextColor="#95A5A6"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#7F8C8D"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Esqueci a senha')}>
              <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
            <Text style={styles.loginButtonText}>ENTRAR</Text>
            <Feather name="arrow-right" size={20} color="#fff" style={{ marginLeft: 5 }} />
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Não tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastre-se')}>
              <Text style={styles.signUpLink}>Cadastre-se</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  cardContainer: {
    width: '100%',
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
    alignSelf: 'center',
  },

  appTagline: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },

  header: {
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontWeight: "800",
    fontSize: 26,
    color: "#2C3E50",
  },

  subtitle: {
    color: "#7F8C8D",
    fontSize: 15,
    marginTop: 4,
  },

  featuresRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: "100%",
  marginBottom: 35,
  paddingHorizontal: 5,
},

featureItem: {
  flex: 1, 
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
},

featureText: {
  fontSize: 13,
  color: '#2C3E50',
  flexShrink: 1, 
  textAlign: "center",
},

  

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',
    width: "100%",
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2C3E50',
  },

  eyeIcon: {
    padding: 5,
  },

  forgotPasswordContainer: {
    alignItems: 'flex-end',
    width: "100%",
    marginBottom: 25,
  },

  forgotPasswordText: {
    color: "#EAB308",
    fontWeight: "600",
  },

  loginButton: {
    flexDirection: 'row',
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
  },

  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: "#FFFFFF",
  },

  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  signUpText: {
    color: '#7F8C8D',
  },

  signUpLink: {
    color: "#EAB308",
    fontWeight: "700",
    marginLeft: 5,
  },

  badge: {
    alignSelf: "center",
    backgroundColor: "#FFE58A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 22,
  },

  badgeText: { color: "#8A6E00", fontWeight: "700", fontSize: 13 },
});

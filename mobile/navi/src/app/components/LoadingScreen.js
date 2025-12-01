import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFDE33" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#4E431B',
  },
});

export default LoadingScreen;
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Animated, Image } from 'react-native';

const LoadingScreen = ({ duration = 3000, onFinish }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            if (onFinish) onFinish();
        }, duration);

        return () => clearTimeout(timer);
    }, [fadeAnim, duration, onFinish]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../assets/carroanimado2.gif')}
                style={styles.gif}
                resizeMode="contain"
            />
            <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
                Carregando...
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#b5b5b5',
    },
    gif: {
        width: 150,      
        height: 150,
        marginBottom: 20,
        transform: [{ scale: 3 }],
    },
    
    loadingText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
});

export default LoadingScreen;

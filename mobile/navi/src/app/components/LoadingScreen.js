import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Animated, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ duration = 3000, onFinish }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        const timer = setTimeout(() => {
            if (onFinish) onFinish();
        }, duration);

        return () => clearTimeout(timer);
    }, [fadeAnim, pulseAnim, duration, onFinish]);

    return (
        <LinearGradient
            colors={['#303030', '#4f4f4f', '#A6A6A6']}
            start={{ x: 1, y: 1 }}
            end={{ x: 0, y: 0 }}
            locations={[0, 0.75, 1]}
            style={styles.container}
        >

            <View style={styles.card}>
                <Image
                    source={require('../../../assets/carroanimado2.gif')}
                    style={styles.gif}
                    resizeMode="contain"
                />
                <Animated.Text style={[styles.loadingText, { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }]}>
                    Carregando...
                </Animated.Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    glow: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: '#FFC300',
        borderRadius: width * 0.4,
        opacity: 0.15,
        bottom: height * 0.2,
        shadowColor: '#FFC300',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 50,
    },

    card: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 25,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(15px)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },

    gif: {
        width: 150,
        height: 150,
        marginBottom: 20,
        transform: [{ scale: 3 }],
    },

    loadingText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 6,
    },
});

export default LoadingScreen;

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import styles from './AjudaStyle';

export default function HelpScreen() {
    const [openIndex, setOpenIndex] = useState(null);

    const faq = [
        {
            question: "Como altero minha senha?",
            answer: "Vá em Configurações > Mudar Senha e siga as instruções exibidas."
        },
        {
            question: "Como editar meu perfil?",
            answer: "Acesse Perfil para atualizar seus dados."
        },
        {
            question: "Não estou recebendo notificações. O que fazer?",
            answer: "Verifique se as notificações estão ativadas nas Configurações e no sistema do seu celular."
        },
        {
            question: "Como excluir minha conta?",
            answer: "Entre em contato com nossa equipe para solicitar a remoção definitiva da sua conta."
        }
    ];

    return (
        <ScrollView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>Ajuda & Suporte</Text>
                <Text style={styles.subtitle}>Encontre respostas rápidas ou fale diretamente com nossa equipe.</Text>
            </View>

            <Text style={styles.sectionTitle}>PERGUNTAS FREQUENTES</Text>

            <View style={styles.section}>
                {faq.map((item, index) => (
                    <View key={index}>
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            <Text style={styles.label}>{item.question}</Text>
                            <Text style={styles.chevron}>{openIndex === index ? "˄" : "˅"}</Text>
                        </TouchableOpacity>

                        {openIndex === index && (
                            <View style={styles.answerBox}>
                                <Text style={styles.answer}>{item.answer}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            <Text style={styles.sectionTitle}>PRECISA DE AJUDA?</Text>

            <View style={styles.section}>
                <TouchableOpacity style={styles.supportButton}>
                    <Text style={styles.supportButtonText}>Falar com a atendente</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

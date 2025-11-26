import React, { useState } from "react";
import {
    View,
    Image,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Text,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLogin } from "../../../providers/loginProvider";
import styles from "./Historicostyle";

const initialHistoryData = [
    {
        id: "h1",
        name: "Estacionamento Central Park",
        address: "Rua das Flores, 123",
        entryTime: "17/11/2025 às 14:30",
        exitTime: "17/11/2025 às 16:45",
        duration: "2h 15min",
        totalPrice: "R$ 15,75",
        status: "Concluído",
        imageUrl: "https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=1074&auto=format&fit=crop"
    },
    {
        id: "h4",
        name: "Estacionamento Central Park",
        address: "Rua das Flores, 123",
        entryTime: "05/11/2025 às 10:00",
        exitTime: "Em Andamento",
        duration: "1 dia, 22h, 48m e 30s",
        totalPrice: "R$ 0,00",
        status: "Pendente",
        imageUrl: "https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=1074&auto=format&fit=crop"
    },
    {
        id: "h2",
        name: "Shopping Park Sul",
        address: "Av. Principal, 400",
        entryTime: "15/11/2025 às 09:00",
        exitTime: "15/11/2025 às 11:30",
        duration: "2h 30min",
        totalPrice: "R$ 17,50",
        status: "Concluído",
        imageUrl: "https://images.unsplash.com/photo-1617886322207-6f504e7472c5?q=80&w=1170&auto=format&fit=crop"
    },
    {
        id: "h3",
        name: "Vagas Premium Leste",
        address: "Alameda dos Anjos, 50",
        entryTime: "10/11/2025 às 18:00",
        exitTime: "10/11/2025 às 18:00",
        duration: "Cancelado",
        totalPrice: "R$ 0,00",
        status: "Cancelado",
        imageUrl: "https://images.unsplash.com/photo-1630165356623-266076eaceb6?q=80&w=1170&auto=format&fit=crop"
    },
];

const STATUS_MAP = {
    'Concluído': { color: '#10B981', icon: 'checkmark-circle-outline', action: 'Ver Detalhes' },
    'Cancelado': { color: '#EF4444', icon: 'close-circle-outline', action: 'Ver Detalhes' },
    'Pendente': { color: '#3B82F6', icon: 'time-outline', action: 'Finalizar Agora' },
};

const HistoryCard = ({ parking, onFinalize }) => {
    const { color, icon, action } = STATUS_MAP[parking.status] || STATUS_MAP['Concluído'];
    const durationIcon = parking.status === 'Pendente' ? 'watch-outline' : 'timer-outline';
    const durationColor = parking.status === 'Pendente' ? '#3B82F6' : '#4B5563';
    const durationLabel = parking.status === 'Pendente' ? 'Tempo Atual' : 'Duração Total';
    const isPending = parking.status === 'Pendente';

    const onPressAction = isPending
        ? () => onFinalize(parking.id)
        : () => console.log(`Ação: ${action} para ID: ${parking.id}`);

    return (
        <View style={styles.card}>
            <Image source={{ uri: parking.imageUrl }} style={styles.cardImage} resizeMode="cover" />

            <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{parking.name}</Text>

                    <View style={[styles.statusBox, { backgroundColor: color }]}>
                        <Ionicons name={icon} size={14} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={styles.statusText}>{parking.status}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{parking.address}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsContainerOptimized}>
                    <View style={styles.detailItemOptimized}>
                        <Text style={styles.detailLabel}>Entrada</Text>
                        <View style={styles.detailValueRow}>
                            <Ionicons name="log-in-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
                            <Text style={styles.detailValueSmallest}>{parking.entryTime}</Text>
                        </View>
                    </View>

                    <View style={styles.detailItemOptimized}>
                        <Text style={styles.detailLabel}>Saída</Text>
                        <View style={styles.detailValueRow}>
                            <Ionicons name="log-out-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
                            <Text style={styles.detailValueSmallest}>{parking.exitTime}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.durationRowContainer}>
                    <View style={styles.durationContainerFull}>
                        <Text style={styles.detailLabel}>{durationLabel}</Text>
                        <View style={styles.durationValueRowFull}>
                            <Ionicons name={durationIcon} size={14} color={durationColor} style={{ marginRight: 5 }} />
                            <Text style={[styles.detailValueSmallest, { color: durationColor }]}>{parking.duration}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.footerRowHistory}>
                    <View style={styles.totalPriceContainer}>
                        <Text style={styles.totalPriceLabel}>Total Pago</Text>
                        <Text style={styles.totalPriceText}>{parking.totalPrice}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: color }]}
                        activeOpacity={0.8}
                        onPress={onPressAction}
                    >
                        <Ionicons name="arrow-forward-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={styles.actionButtonTextSmall}>{action}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default function Historico() {
    const { user } = useLogin();
    const userName = user?.nome || "Cliente";

    const [history, setHistory] = useState(initialHistoryData);
    const [activeFilter] = useState('Todos');

    const handleFinalize = (id) => {
        const index = history.findIndex(item => item.id === id);
        if (index === -1) return;

        const now = new Date();
        const simulatedExitTime =
            `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        const updatedHistory = [...history];
        updatedHistory[index] = {
            ...updatedHistory[index],
            exitTime: simulatedExitTime,
            duration: "2 dias, 15h e 50min",
            totalPrice: "R$ 45,50",
            status: "Concluído",
        };

        setHistory(updatedHistory);
    };

    const filteredHistory = history
        .sort((a, b) => (a.status === "Pendente" ? -1 : 1))
        .filter(item => activeFilter === "Todos" || item.status === activeFilter);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />

            <ScrollView contentContainerStyle={styles.scrollContentHistory}>
                <View style={styles.pageTitleContainer}>
                    <Text style={styles.mainTitle}>Histórico de Estacionamento</Text>
                </View>

                <View style={styles.recommendationsContainer}>
                    {filteredHistory.map((parking) => (
                        <HistoryCard
                            key={parking.id}
                            parking={parking}
                            onFinalize={handleFinalize}
                        />
                    ))}

                    {filteredHistory.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={50} color="#9CA3AF" />
                            <Text style={styles.emptyStateText}>Nenhum estacionamento encontrado.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

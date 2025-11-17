import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import HistoricoCard from "../../components/HistoricoCard";

export default function HistoricoScreen() {
  const historico = [
    {
      id: "2",
      name: "Garagem Vista Mall",
      date: "10/11/2025",
      duration: "1h 10min",
      pricePaid: "R$ 8,00",
      imageUrl:
        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1074&auto=format&fit=crop",
    },

    {
      id: "3",
      name: "Parking Plaza Norte",
      date: "03/11/2025",
      duration: "3h 45min",
      pricePaid: "R$ 22,00",
      imageUrl:
        "https://images.unsplash.com/photo-1506521781225-2ddf33dba79c?q=80&w=1080&auto=format&fit=crop",
    },

    {
      id: "4",
      name: "Estacionamento Aeroporto Pro",
      date: "28/10/2025",
      duration: "5h 20min",
      pricePaid: "R$ 40,00",
      imageUrl:
        "https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1074&auto=format&fit=crop",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Seu Histórico</Text>

      {historico.map((item) => (
        <HistoricoCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
});

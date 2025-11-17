import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function HistoricoCard({ item }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      <View style={styles.infoBox}>
        <Text style={styles.name}>{item.name}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Data:</Text>
          <Text style={styles.value}>{item.date}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Duração:</Text>
          <Text style={styles.value}>{item.duration}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Preço pago:</Text>
          <Text style={styles.value}>{item.pricePaid}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 180,
  },

  infoBox: {
    padding: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },

  value: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
});

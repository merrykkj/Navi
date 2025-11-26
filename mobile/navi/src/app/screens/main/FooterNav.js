import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FooterNav({ activeTab, setActiveTab }) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => setActiveTab("home")} style={styles.tabContainer}>
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={24}
          color={activeTab === "home" ? "#fff" : "#fff"}
        />
        <Text style={[styles.tab, activeTab === "home" && styles.active]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setActiveTab("historico")} style={styles.tabContainer}>
        <Ionicons
          name={activeTab === "historico" ? "time" : "time-outline"}
          size={24}
          color={activeTab === "historico" ? "#fff" : "#fff"}
        />
        <Text style={[styles.tab, activeTab === "historico" && styles.active]}>Histíorico</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setActiveTab("profile")} style={styles.tabContainer}>
        <Ionicons
          name={activeTab === "profile" ? "person" : "person-outline"}
          size={24}
          color={activeTab === "profile" ? "#fff" : "#fff"}
        />
        <Text style={[styles.tab, activeTab === "profile" && styles.active]}>Profile</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#EAB308",
    borderRadius: 30,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  tabContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tab: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
  active: {
    color: "#fff",
    fontWeight: "bold",
  },
});

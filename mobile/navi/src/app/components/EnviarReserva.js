// ReservationModal.js
import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY_COLOR = "#EAB308";
const TEXT_COLOR = "#1F2937";

export default function ReservationModal({ visible, onClose, parking }) {
  const [hours, setHours] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  const calculatePrice = () => {
    const priceNumber = parseFloat(parking.price.replace("R$ ", "").replace("/h", ""));
    const hoursNumber = parseFloat(hours);
    if (!isNaN(priceNumber) && !isNaN(hoursNumber)) {
      setTotalPrice(priceNumber * hoursNumber);
    } else {
      setTotalPrice(0);
    }
  };

  const handleConfirm = () => {
    alert(`Você reservou ${parking.name} por ${hours} hora(s). Total: R$ ${totalPrice.toFixed(2)}`);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Reservar {parking.name}</Text>

          <Text style={styles.label}>Horas que deseja reservar:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Digite o número de horas"
            value={hours}
            onChangeText={setHours}
          />

          <TouchableOpacity style={styles.calculateButton} onPress={calculatePrice}>
            <Text style={styles.buttonText}>Calcular preço</Text>
          </TouchableOpacity>

          {totalPrice > 0 && (
            <Text style={styles.totalText}>Preço total: R$ {totalPrice.toFixed(2)}</Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: TEXT_COLOR, marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 8, color: TEXT_COLOR },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
    color: TEXT_COLOR,
  },
  calculateButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  totalText: { fontSize: 16, fontWeight: "600", marginVertical: 8, color: TEXT_COLOR },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  confirmButton: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#6B7280",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

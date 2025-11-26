import React, { useState } from "react";
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from "../../../providers/loginProvider"; 

const parkingData = [
  {
    id: "1",
    name: "Estacionamento Central Park",
    rating: 4.7,
    distance: "300m",
    price: "R$ 6/h",
    tags: ["Coberto", "Segurança 24h"],
    availableSpots: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=1074&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Vagas Premium Leste",
    rating: 4.2,
    distance: "850m",
    price: "R$ 10/h",
    tags: ["VIP", "Recarga Elétrica"],
    availableSpots: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1630165356623-266076eaceb6?q=80&w=1170&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Shopping Park Sul",
    rating: 4.9,
    distance: "1.2km",
    price: "R$ 5/h",
    tags: ["Aberto", "Auto-serviço"],
    availableSpots: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1617886322207-6f504e7472c5?q=80&w=1170&auto=format&fit=crop",
  },
];

const quickActions = [
  { title: "Coberto", icon: "shield-outline", filter: "coberto" },
  { title: "Mais Barato", icon: "pricetag-outline", filter: "maisBarato" },
  { title: "Mais Próximo", icon: "navigate-outline", filter: "maisProximo" },
  { title: "Aberto Agora", icon: "time-outline", filter: "abertoAgora" },
];

const QuickAction = ({ icon, title, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.quickActionButton, selected && styles.quickActionButtonSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={[
        styles.quickActionIconContainer,
        selected && styles.quickActionIconSelected,
      ]}
    >
      <Ionicons name={icon} size={26} color={selected ? "#fff" : "#1F2937"} />
    </View>
    <Text
      style={[styles.quickActionText, selected && styles.quickActionTextSelected]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const ParkingCard = ({ parking }) => (
  <View style={styles.card}>
    <Image source={{ uri: parking.imageUrl }} style={styles.cardImage} />

    <View style={styles.cardContent}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{parking.name}</Text>
      </View>

      <View style={styles.ratingDistanceRow}>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#fff" />
          <Text style={styles.ratingText}>{parking.rating.toFixed(1)}</Text>
        </View>

        <Text style={styles.dotSeparator}>•</Text>
        <Ionicons
          name="navigate-circle-outline"
          size={16}
          color="#6B7280"
          style={{ marginRight: 4 }}
        />
        <Text style={styles.distanceText}>{parking.distance}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.newPriceLabel}>Preço/h:</Text>
          <Text style={styles.newPriceText}>{parking.price}</Text>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {parking.tags.map((tag, index) => (
          <Text key={index} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.spotsText}>
          <Text style={styles.spotsCount}>{parking.availableSpots}</Text> vagas
          disponíveis
        </Text>

        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Reservar</Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color="#fff"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const MapPlaceholder = () => (
  <View style={styles.mapContainer}>
    <Image
      source={{
        uri: "https://images.unsplash.com/photo-1596765796791-030f8f877684?fit=crop&w=1200&q=80",
      }}
      style={styles.mapImage}
    />
  </View>
);

export default function HomeScreen() {
  const { user } = useLogin();
  const userName = user?.nome || "Usuário";

  const [selectedFilters, setSelectedFilters] = useState([]);

  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent />

      <MapPlaceholder />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TOP */}
        <View style={styles.topContentOverlay}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingTitle}>Olá, {userName}</Text>
              <Text style={styles.greetingSubtitle}>Pronto para estacionar?</Text>
            </View>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchBarInput}
                placeholder="Pesquisar estacionamento por endereço..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity style={styles.locationButton}>
              <Ionicons name="locate-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                icon={action.icon}
                title={action.title}
                selected={selectedFilters.includes(action.filter)}
                onPress={() => toggleFilter(action.filter)}
              />
            ))}
          </View>
        </View>

        {/* CARROSSEL */}
        <Text style={styles.sectionTitle}>Ofertas e Promoções</Text>
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            contentContainerStyle={styles.carousel}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1170",
              }}
              style={styles.carouselImage}
            />
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1170",
              }}
              style={styles.carouselImage}
            />
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1170",
              }}
              style={styles.carouselImage}
            />
          </ScrollView>
        </View>

        {/* RECOMENDAÇÕES */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recomendados na Região</Text>

          {parkingData.map((parking) => (
            <ParkingCard key={parking.id} parking={parking} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

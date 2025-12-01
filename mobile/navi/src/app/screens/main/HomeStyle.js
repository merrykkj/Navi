import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");
const PADDING = width * 0.05;

// Paleta premium refinada
const PRIMARY_COLOR = "#F5B301";
const TEXT_COLOR = "#1A1A1A";
const SUBTEXT = "#6B7280";
const CARD_BG = "#FFFFFF";
const LIGHT_BG = "#F8F8F8";

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },

  /* MAPA */
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  mapImage: {
    flex: 1,
    opacity: 0.88,
    transform: [{ scale: 1.03 }],
  },

  /* SCROLL */
  scrollContent: {
    paddingBottom: 80,
    zIndex: 1,
  },

  /* CABEÇALHO COM GLASSMORPHISM */
  topContentOverlay: {
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 15,

    // Melhor efeito glass + luz suave
    ...(Platform.OS === "ios"
      ? { backdropFilter: "blur(18px)" }
      : { backgroundColor: "rgba(255,255,255,0.90)" }),

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },

  /* HEADER */
  header: {
    paddingHorizontal: PADDING,
    paddingVertical: 22,
  },

  greetingTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: TEXT_COLOR,
    letterSpacing: -0.7,
    textShadowColor: "rgba(0,0,0,0.08)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  greetingSubtitle: {
    fontSize: 16,
    color: SUBTEXT,
    opacity: 0.85,
    marginTop: 4,
  },

  /* PESQUISA */
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING,
    marginBottom: 20,
  },

  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E7E7E7",

    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  searchBarInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    marginLeft: 10,
  },

  locationButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    padding: 15,

    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },

  /* QUICK ACTIONS */
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: PADDING,
    marginTop: 12,
  },

  quickActionButton: {
    alignItems: "center",
    width: (width - PADDING * 2 - 40) / 4,
  },

  quickActionButtonSelected: {
    transform: [{ scale: 1.12 }],
  },

  quickActionIconContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 50,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E3E3E3",

    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  quickActionIconSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 7,
  },

  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: SUBTEXT,
  },

  quickActionTextSelected: {
    color: PRIMARY_COLOR,
    fontWeight: "800",
  },

  /* TÍTULOS */
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: TEXT_COLOR,
    paddingHorizontal: PADDING,
    marginBottom: 18,
    marginTop: 22,
    letterSpacing: -0.4,
  },

  /* CARROSSEL */
  carouselContainer: {
    marginBottom: 40,
  },

  carousel: {
    paddingLeft: PADDING,
  },

  carouselImage: {
    width: width * 0.88,
    height: 200,
    borderRadius: 22,
    marginRight: 20,

    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 10,
  },

  /* LISTA */
  recommendationsContainer: {
    paddingHorizontal: PADDING,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    marginBottom: 30,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#ECECEC",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  cardImage: {
    width: "100%",
    height: 180,
  },

  cardContent: {
    padding: 20,
  },

  cardHeaderRow: {
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: TEXT_COLOR,
    letterSpacing: -0.3,
  },

  /* INFO */
  ratingDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  ratingText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 5,
    fontWeight: "700",
  },

  distanceText: {
    fontSize: 15,
    color: SUBTEXT,
    fontWeight: "600",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  newPriceLabel: {
    fontSize: 12,
    color: SUBTEXT,
    marginRight: 5,
    fontWeight: "600",
  },

  newPriceText: {
    fontSize: 16,
    fontWeight: "900",
    color: PRIMARY_COLOR,
  },

  /* TAGS */
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  tag: {
    backgroundColor: LIGHT_BG,
    fontSize: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    marginRight: 8,
    marginBottom: 8,
    fontWeight: "700",
    color: TEXT_COLOR,
  },

  /* FOOTER */
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  spotsText: {
    fontSize: 15,
    color: SUBTEXT,
  },

  spotsCount: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT_COLOR,
  },

  reserveButton: {
    flexDirection: "row",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,

    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },

  reserveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});

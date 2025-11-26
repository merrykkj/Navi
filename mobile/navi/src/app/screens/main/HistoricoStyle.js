import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const PADDING = width * 0.05;
const PRIMARY_COLOR = "#EAB308";
const TEXT_COLOR = "#1F2937";

export default StyleSheet.create({
    safeArea: {
        flex: 1
    },
    pageTitleContainer: {
        paddingHorizontal: PADDING,
        paddingTop: 15,
        paddingBottom: 20,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: TEXT_COLOR
    },
    scrollContentHistory: {
        paddingBottom: 40
    },
    recommendationsContainer: {
        paddingHorizontal: PADDING
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        marginBottom: 16,
        elevation: 5,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: '#eee',
    },
    cardImage: {
        width: "100%",
        height: 120
    },
    cardContent: {
        padding: 15
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: TEXT_COLOR,
        flexShrink: 1,
        marginRight: 10,
    },
    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#fff",
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 10,
    },
    detailsContainerOptimized: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailItemOptimized: {
        alignItems: 'flex-start',
        width: '48%',
    },
    detailLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    detailValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailValueSmallest: {
        fontSize: 11,
        color: TEXT_COLOR,
        fontWeight: '600',
        flexShrink: 1,
    },
    durationRowContainer: {
        marginBottom: 0,
    },
    durationContainerFull: {
        alignItems: 'flex-start',
        width: '100%',
    },
    durationValueRowFull: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    footerRowHistory: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },
    totalPriceContainer: {
        alignItems: 'flex-start',
    },
    totalPriceLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 2,
    },
    totalPriceText: {
        fontSize: 15,
        fontWeight: "900",
        color: PRIMARY_COLOR,
    },
    actionButton: {
        flexDirection: "row",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    actionButtonTextSmall: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    emptyStateText: {
        marginTop: 15,
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '600',
        textAlign: 'center',
    }
});

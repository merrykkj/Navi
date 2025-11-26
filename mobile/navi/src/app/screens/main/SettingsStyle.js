import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 22,
        paddingVertical: 30,
        backgroundColor: "#fff",
        borderBottomWidth: 2,
        borderBottomColor: "#FFD84D",
        marginBottom: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1F1F1F',
    },
    subtitle: {
        fontSize: 15,
        marginTop: 6,
        color: '#6E6E73',
    },
    sectionTitle: {
        marginTop: 28,
        marginLeft: 22,
        marginBottom: 10,
        fontSize: 14,
        fontWeight: "700",
        color: "#7A7A7F",
        letterSpacing: 1,
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#ECECEC",
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
            },
            android: {
                elevation: 3,
            }
        })
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E6E6E6",
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    icon: {
        fontSize: 22,
        width: 30,
        textAlign: 'center',
        color: "#FFC72C",
        fontWeight: '900',
        marginRight: 15,
    },
    label: {
        fontSize: 17,
        color: "#262626",
        fontWeight: "500",
    },
    detail: {
        fontSize: 14,
        color: "#9A9A9E",
        marginRight: 6,
    },
    chevron: {
        fontSize: 18,
        color: "#CACACE",
        fontWeight: "700",
    }
});

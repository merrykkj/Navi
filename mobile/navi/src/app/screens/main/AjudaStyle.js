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
        fontSize: 28,
        fontWeight: '800',
        color: '#1F1F1F',
    },
    subtitle: {
        fontSize: 15,
        marginTop: 6,
        color: '#6E6E73',
    },
    sectionTitle: {
        marginTop: 25,
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

    // FAQ
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E6E6E6",
    },
    label: {
        fontSize: 16,
        color: "#262626",
        fontWeight: "500",
        flex: 1,
        paddingRight: 10,
    },
    chevron: {
        fontSize: 20,
        color: "#B1B1B5",
        fontWeight: "700",
    },
    answerBox: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#FAFAFA",
    },
    answer: {
        fontSize: 15,
        color: "#5A5A5F",
        lineHeight: 20,
    },


    supportButton: {
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#FFC72C",
    },
    supportButtonText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
    }
});

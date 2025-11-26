import { StyleSheet, Dimensions } from 'react-native';

export const windowWidth = Dimensions.get('window').width;
export const FOOTER_CLEARANCE = 120;

export const COLORS = {
  primary: '#FFD700',
  primaryDark: '#EAB308',
  textDark: '#333333',
  textMedium: '#666666',
  textLight: '#999999',
  background: '#FFFBEA',
  cardBackground: '#FFFFFF',
  border: '#E0E0E0',
  separator: '#EBEBEB',
  inputBackground: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: { 
    paddingTop: 24, 
    paddingBottom: FOOTER_CLEARANCE, 
    alignItems: 'center', 
    backgroundColor: COLORS.background, 
  },

  card: {
    width: Math.min(windowWidth - 32, 700),
    padding: 24,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },

  separator: {
    height: 1, 
    backgroundColor: COLORS.separator,
    marginVertical: 25, 
    width: '100%',
  },

  header: { alignItems: 'center', marginBottom: 30, paddingTop: 10 },
  
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 3, 
    borderColor: COLORS.border, 
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#EAB308', 
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: COLORS.cardBackground, 
  },
  
  headerInfo: { alignItems: 'center' },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.textDark },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  role: { fontSize: 14, color: COLORS.textMedium, marginLeft: 6 },

  inputNameEdit: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 2,
    textAlign: 'center',
    marginBottom: 4,
  },

  sectionTitle: { marginTop: 24, marginBottom: 10, fontSize: 18, fontWeight: '700', color: COLORS.textDark },

  box: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  icon: { marginRight: 12 },
  infoContent: { flex: 1 },

  label: { fontSize: 12, color: COLORS.textMedium },
  value: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginTop: 2 },

  input: {
    backgroundColor: COLORS.inputBackground, 
    borderWidth: 1,
    borderColor: COLORS.border, 
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    fontSize: 16,
    color: COLORS.textDark,
  },

  actionButtonsContainer: { 
    alignItems: 'center',
    marginTop: 30,
  },
  
  buttonPrimary: {
    backgroundColor: COLORS.primaryDark, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.primaryDark, 
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  buttonPrimaryText: { color: 'white', fontWeight: '700', fontSize: 16 },
  
  buttonCancel: { marginTop: 15, padding: 5 },
  buttonCancelText: { 
    color: COLORS.textMedium, 
    fontWeight: '600', 
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default styles;

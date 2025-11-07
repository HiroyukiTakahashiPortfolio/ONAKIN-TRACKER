import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },

  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { color: 'white', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#cbd5e1', marginTop: 2 },
  bold: { fontWeight: '900', color: 'white' },

  card: { backgroundColor: 'white', marginHorizontal: 16, marginVertical: 12, borderRadius: 16, padding: 16 },

  rankBadge: { fontSize: 16, fontWeight: '900', color: '#0f172a', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  rankSub: { marginTop: 6, color: '#374151' },
  daysBig: { fontSize: 64, lineHeight: 72, fontWeight: '900', color: '#0f172a', marginTop: 10 },
  daysLabel: { fontSize: 16, color: '#374151', fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  muted: { color: '#6b7280' },

  btn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  btnText: { color: 'white', fontWeight: '800' },

  articleRow: { marginBottom: 12 },
  articleText: { color: '#111827', lineHeight: 20, marginTop: 4 },

  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  rowItem: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },

  input: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', color: '#111827', flex: 1 },
  inputMultiline: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', color: '#111827', minHeight: 120 },

  msgRow: { marginBottom: 10, backgroundColor: '#f8fafc', padding: 8, borderRadius: 10 },
  msgName: { fontWeight: '800', color: '#0f172a' },
  msgText: { color: '#111827' },
  msgMeta: { color: '#64748b', fontSize: 12 },
  hideBtn: { marginTop: 6, backgroundColor: '#ef4444', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },

  tabbar: { flexDirection: 'row', backgroundColor: '#0b1220', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#172036' },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabBtnActive: { backgroundColor: '#111827' },
  tabText: { color: '#94a3b8', fontWeight: '800' },
  tabTextActive: { color: '#16a34a' },

  modalSafe: { flex: 1, backgroundColor: 'white', padding: 16, justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  preview: { color: '#111827', marginTop: 2 },
  min: { color: '#64748b', fontSize: 12 },
});

export default styles;

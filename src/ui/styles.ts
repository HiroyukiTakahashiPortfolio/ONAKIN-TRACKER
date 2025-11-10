// src/ui/styles.ts
import { StyleSheet, Platform } from 'react-native';

const PALETTE = {
  bg: '#d1dfecff', // 全体背景
  card: '#FAFBFC', // ← 白より少しグレー。柔らかくて上品。
  surface: '#F0F6FB',
  border: '#E1E8EF',
  text: '#1E293B',
  textMuted: '#64748B',
  heading: '#0F172A',
  accent: '#3B82F6',
  accentLight: '#E0F2FE',
  accentBorder: '#8fb3ddff',
  danger: '#EF4444',
};

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 3 },
  default: {},
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PALETTE.bg },

  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { color: PALETTE.heading, fontSize: 20, fontWeight: '800' },
  subtitle: { color: PALETTE.textMuted, marginTop: 2 },

  card: {
    backgroundColor: PALETTE.card, // ← 柔らかい白
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    ...cardShadow,
  },

  rankBadge: {
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.accent,
    backgroundColor: PALETTE.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.accentBorder,
  },

  rankSub: { marginTop: 6, color: PALETTE.textMuted },
  daysBig: { fontSize: 64, lineHeight: 72, fontWeight: '900', color: PALETTE.heading, marginTop: 10 },
  daysLabel: { fontSize: 16, color: PALETTE.textMuted, fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8, color: PALETTE.heading },
  muted: { color: PALETTE.textMuted },

  btn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: PALETTE.accent,
    ...cardShadow,
  },
  btnText: { color: '#FFFFFF', fontWeight: '800' },

  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },

// src/ui/styles.ts のフッター関連をこれに戻す
tabbar: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',      // ライト版のまま
  paddingVertical: 8,
  borderTopWidth: 1,
  borderTopColor: '#E2E8F0',
},
tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8 },
tabBtnActive: { backgroundColor: '#E0F2FE' },
tabText: { color: '#64748B', fontWeight: '800' },
tabTextActive: { color: '#3B82F6' },

});

export default styles;

import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { pickAffiliates } from '../constants/affiliates';

// RecItem は recommended.ts の型に合わせる
export type RecItem = {
  title: string;
  subtitle?: string;
  link: string;
  icon?: string;
};

type Props = {
  title?: string;            // カード見出し（省略時は "今読むと効く記事"）
  stageLabel?: string;       // 称号など（任意）
  items: RecItem[];          // 日数で選ばれた外部ブログ記事リスト
  seed?: number;             // ここに elapsedDays を渡す（表示を日数で安定化）
};

export default function RecommendedArticles({
  title = '今読むと効く記事',
  items,
  seed = 1,
}: Props) {
  const aff = useMemo(() => pickAffiliates(seed, 1), [seed]);


  const row = (k: string, t: string, s?: string, leftIcon?: string, link?: string) => (
    <Pressable
      key={k}
      onPress={() => {
        if (link) WebBrowser.openBrowserAsync(link);
      }}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#0b1220',
        marginBottom: 6,
        opacity: link ? 1 : 0.9,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {!!leftIcon && <Text style={{ fontSize: 14 }}>{leftIcon}</Text>}
        <Text style={{ color: '#e2e8f0', fontWeight: '800' }}>{t}</Text>
      </View>
      {!!s && <Text style={{ color: '#94a3b8', marginTop: 2, fontSize: 12 }}>{s}</Text>}
    </Pressable>
  );

  return (
    <View style={{ backgroundColor: '#0b1220', borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 12 }}>
      <Text style={{ color: '#e5e7eb', fontWeight: '800', marginBottom: 8 }}>{title}</Text>

      {/* ─ 外部ブログ：日数によるおすすめ ─ */}
      <View>
        {items.map((it, i) =>
          row(`${it.link}-${i}`, it.title, it.subtitle, it.icon ?? '🔗', it.link)
        )}
      </View>

      {/* 仕切り */}
      <View style={{ height: 10 }} />
      <View style={{ backgroundColor: '#111827', height: 1, opacity: 0.6 }} />
      <View style={{ height: 8 }} />

      {/* ─ PR：キラーページ（ランダム3件） ─ */}
      <Text style={{ color: '#9ca3af', fontWeight: '700', marginBottom: 6 }}>おすすめ特集（PR）</Text>
      <View>
        {aff.map((a, i) =>
          row(`aff-${a.id}-${i}`, a.title, undefined, a.icon ?? '⭐', a.url)
        )}
      </View>
    </View>
  );
}

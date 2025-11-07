import React from 'react';
import { View, Text, Pressable, Alert, Linking } from 'react-native';
import styles from '../ui/styles';
import type { ExtArticle } from '../constants/recommended';

export default function RecommendedArticles({ stageLabel, items }: { stageLabel: string; items: ExtArticle[] }) {
  const open = async (url: string) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (!ok) return Alert.alert('URLを開けませんでした', url);
      await Linking.openURL(url);
    } catch {
      Alert.alert('リンクを開く際にエラーが発生しました');
    }
  };

  if (!items.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>乗り越えるためのおすすめ記事</Text>
      <Text style={{ color: '#6b7280', marginBottom: 6 }}>（{stageLabel} に効く）</Text>
      {items.map((a) => (
        <Pressable key={a.id} onPress={() => open(a.url)} style={styles.recRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', color: '#0f172a' }}>{a.title}</Text>
            {a.desc ? <Text style={{ color: '#374151', marginTop: 2 }}>{a.desc}</Text> : null}
          </View>
          <Text style={{ color: '#64748b', fontSize: 22, marginLeft: 8 }}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

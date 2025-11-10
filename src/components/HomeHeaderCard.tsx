import React from 'react';
import { View, Text, Button } from 'react-native';
import useStartTime from '../hooks/useStartTime';
import useElapsedSince from '../hooks/useElapsedSince';
import resetStreak from '../actions/resetStreak';

export default function HomeHeaderCard() {
  const { startISO, setStartISO } = useStartTime();
  const elapsed = useElapsedSince(startISO);

  // あなたの既存デザインに合わせてstyleは調整
  return (
    <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#0b1222' }}>
      {/* 既存の “X 日 経過” 表示 */}
      <Text style={{ fontSize: 40, fontWeight: '800', textAlign: 'center' }}>
        {elapsed.days}
      </Text>
      <Text style={{ textAlign: 'center' }}>日 経過</Text>

      {/* ← 追加：経過時間 */}
      <Text style={{ textAlign: 'center', marginTop: 6, opacity: 0.85 }}>
        （{elapsed.label} / {elapsed.hms}）
      </Text>

      {/* 既存のリセットボタン差し替え */}
      <View style={{ marginTop: 12 }}>
        <Button
          title="リセット（やり直し）"
          onPress={async () => {
            const iso = await resetStreak();
            if (iso) setStartISO(iso); // 表示を即更新
          }}
        />
      </View>
    </View>
  );
}

import React from 'react';
import { View, Text, Button, Image } from 'react-native';
import useStartTime from '../hooks/useStartTime';
import useElapsedSince from '../hooks/useElapsedSince';
import resetStreak from '../actions/resetStreak';

export default function HomeHeaderCard() {
  const { startISO, setStartISO } = useStartTime();
  const elapsed = useElapsedSince(startISO);

  return (
    
    <View
      style={{
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#0b1222',
      }}
    >
      {/* ★ ロゴ＋タイトル行 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Image
          source={require('../../assets/mindreset-logo.png')}
          style={{ width: 32, height: 32, marginRight: 8, backgroundColor: 'red' }}
          resizeMode="contain"
        />
        <Image
  source={require('../../assets/mindreset-logo.png')}
  style={{ width: 32, height: 32, marginRight: 8, backgroundColor: 'red' }}
  resizeMode="contain"
/>



        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#ffffff',
          }}
        >
          俺のオナ禁トラッカー
        </Text>
      </View>

      {/* 日数 */}
      <Text
        style={{
          fontSize: 40,
          fontWeight: '800',
          textAlign: 'center',
          color: '#ffffff',
        }}
      >
        {elapsed.days}
      </Text>
      <Text style={{ textAlign: 'center', color: '#ffffff' }}>日 経過</Text>

      {/* 経過時間 */}
      <Text
        style={{
          textAlign: 'center',
          marginTop: 6,
          opacity: 0.85,
          color: '#ffffff',
        }}
      >
        （{elapsed.label} / {elapsed.hms}）
      </Text>

      {/* リセットボタン */}
      <View style={{ marginTop: 12 }}>
        <Button
          title="リセット（やり直し）"
          onPress={async () => {
            const iso = await resetStreak();
            if (iso) setStartISO(iso);
          }}
        />
      </View>
    </View>
  );
}

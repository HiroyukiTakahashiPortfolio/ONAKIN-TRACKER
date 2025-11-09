// src/screens/AdminScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { logoutSupabase } from '../lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from '../components/PrimaryButton';
import styles from '../ui/styles';

export default function AdminScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 起動時に現在ログイン中のユーザーを確認
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (u) {
        setEmail(u.email ?? null);
        setUserId(u.id ?? null);
      } else {
        setEmail(null);
        setUserId(null);
      }
    })();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      <View style={[styles.card, { alignItems: 'center' }]}>
        <Text style={styles.sectionTitle}>管理・アカウント情報</Text>

        {email ? (
          <>
            <Text style={{ fontSize: 16, marginTop: 8 }}>
              現在ログイン中のメール:
            </Text>
            <Text style={{ fontWeight: '800', marginTop: 4 }}>{email}</Text>

            <Text style={{ fontSize: 14, marginTop: 8, opacity: 0.7 }}>
              ユーザーID（Supabase）:
            </Text>
            <Text
              selectable
              style={{
                fontSize: 12,
                marginTop: 4,
                fontFamily: 'monospace',
                color: '#666',
              }}
            >
              {userId}
            </Text>

            <PrimaryButton
              label="ログアウト"
              onPress={async () => {
                try {
                  await logoutSupabase();
                  await AsyncStorage.removeItem('supa_link_suppressed');
                  setEmail(null);
                  alert('ログアウトしました');
                } catch (e: any) {
                  alert(`ログアウト失敗: ${e.message}`);
                }
              }}
            />
          </>
        ) : (
          <>
            <Text style={{ marginTop: 16 }}>
              現在ログインしていません。
            </Text>
            <Text style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              「ホーム」＞「オンライン機能を有効化」でログインできます。
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

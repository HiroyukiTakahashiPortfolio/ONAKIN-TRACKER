// src/screens/AdminScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { logoutSupabase } from '../lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from '../components/PrimaryButton';
import styles from '../ui/styles';
import dayjs from '../lib/dayjs';
import useAppState from '../state/useAppState';

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

  // 🔧 デバッグ用：経過日数を操作するための state
  const [daysText, setDaysText] = useState('0');
  const { resetCounter } = useAppState();

  // 🔧 デバッグ用関数：指定日数に上書き
  const setMyElapsedDays = async () => {
    const n = Math.max(0, Math.floor(Number(daysText) || 0));
    const targetISO = dayjs().subtract(n, 'day').toISOString();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .update({ streak_started_at: targetISO })
      .eq('user_id', user.id);

    if (error) {
      console.warn(error);
      alert('経過日数の変更に失敗しました。');
      return;
    }

    await resetCounter(targetISO);
    alert(`経過日数を ${n} 日に変更しました。`);
  };

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

      {/* 🔧 ======== デバッグ専用セクション（後で削除してOK） ======== */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>🧪 デバッグ：経過日数を上書き</Text>
        <Text style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
          テスト目的で経過日数を任意に設定できます。
        </Text>

        <TextInput
          value={daysText}
          onChangeText={setDaysText}
          keyboardType="number-pad"
          placeholder="例: 7"
          style={{
            borderWidth: 1,
            borderColor: '#334155',
            backgroundColor: '#0b1220',
            color: '#e2e8f0',
            height: 40,
            fontSize: 14,
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 8,
          }}
        />
        <PrimaryButton label="この日数にする" onPress={setMyElapsedDays} />
        <Text style={{ marginTop: 8, opacity: 0.6, fontSize: 12 }}>
          ※ 現在のユーザーのみ変更されます（RLS保護下）。
        </Text>
      </View>
      {/* 🔧 ======== デバッグセクションここまで ======== */}
    </ScrollView>
  );
}

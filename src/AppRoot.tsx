// src/AppRoot.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

import useAppState, { AppStateProvider } from './state/useAppState';
import styles from './ui/styles';

// screens
import HomeScreen from './screens/HomeScreen';
import ArticlesScreen from './screens/ArticlesScreen';
import CalendarJournalScreen from './screens/CalendarJournalScreen';
import AdminScreen from './screens/AdminScreen';
import PeriodChatScreen from './screens/PeriodChatScreen';
import AuthScreen from './screens/AuthScreen';

// Supabase関連
import { supabase } from './lib/supabase';
import { logoutSupabase } from './lib/auth';

export default function AppRoot() {
  return (
    <AppStateProvider>
      <InnerApp />
    </AppStateProvider>
  );
}

type AuthPhase = 'checking' | 'authed' | 'guest';

function InnerApp() {
  const insets = useSafeAreaInsets();
  const { tab, setTab, title, elapsedDays, user } = useAppState();

  // ヘッダー表示用
  const [email, setEmail] = useState<string | null>(null);
  const [authPhase, setAuthPhase] = useState<AuthPhase>('checking');

  // 起動時にセッション取得 → 以後も購読
  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;
      setEmail(session?.user?.email ?? null);
      setAuthPhase(session ? 'authed' : 'guest');

      const sub = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setEmail(nextSession?.user?.email ?? null);
        setAuthPhase(nextSession ? 'authed' : 'guest');
        if (nextSession) setTab('Home');
      });
      unsub = () => sub.data.subscription.unsubscribe();
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [setTab]);

  // ログアウト
  async function onPressLogout() {
    try {
      await logoutSupabase();
      setEmail(null);
      setAuthPhase('guest');
      setTab('Home');
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        alert('ログアウトしました');
      }
    } catch (e: any) {
      const msg = String(e?.message ?? 'Unknown error');
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        alert(`ログアウト失敗: ${msg}`);
      } else {
        Alert.alert('ログアウト失敗', msg);
      }
    }
  }

  const TabBar = () => {
    const items: { key: typeof tab; label: string }[] = [
      { key: 'Home', label: 'ホーム' },
      { key: 'Articles', label: '記事' },
      { key: 'Calendar', label: '日記' },
      { key: 'Chat', label: 'チャット' },
      { key: 'Admin', label: '管理' },
    ];
    return (
      <View style={styles.tabbar}>
        {items.map((it) => {
          const active = tab === it.key;
          return (
            <TouchableOpacity
              key={it.key}
              onPress={() => setTab(it.key)}
              activeOpacity={0.7}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{it.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // 認証判定が終わるまで何も出さない（スプラッシュのみ）
  if (authPhase === 'checking') {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <StatusBar style="light" />
        <ActivityIndicator />
        <Text style={[styles.muted, { marginTop: 8 }]}>起動中…</Text>
      </SafeAreaView>
    );
  }

  // 未ログイン時は AuthScreen のみ描画（本体は一切描画しない）
  if (authPhase === 'guest') {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  // ここから先は “ログイン済み” のみ
  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* ヘッダー */}
      <View
        style={[
          styles.header,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 8,
            zIndex: 10,
          },
        ]}
      >
        {/* 左：ロゴ + タイトル */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 8,
          }}
        >
          <Image
            source={require('../assets/mindreset-logo.png')}
            style={{
              width: 140,
              height: 60,
              marginRight: 10,
            }}
            resizeMode="contain"
          />
          <View style={{ marginTop: 2 }}>
            <Text style={styles.title}>
              {user ? `${user.name} のMind Reset` : 'Mind Reset'}
            </Text>
            <Text style={styles.subtitle}>
              称号: <Text style={styles.bold}>{title}</Text>／ 経過:{' '}
              <Text style={styles.bold}>{elapsedDays}</Text>日
            </Text>
          </View>
        </View>

        {/* 右：メール + ログアウト */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {email ? (
            <Text
              style={[styles.muted, { fontSize: 12, marginRight: 8, maxWidth: 220 }]}
              numberOfLines={1}
            >
              {email}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={onPressLogout}
            activeOpacity={0.7}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#334155',
              backgroundColor: '#0b1220',
            }}
          >
            <MaterialIcons name="logout" size={16} color="#cbd5e1" />
            <Text
              style={{
                color: '#cbd5e1',
                fontSize: 12,
                fontWeight: '700',
                marginLeft: 6,
              }}
            >
              ログアウト
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 画面本体 */}
      <View style={{ flex: 1 }}>
        {tab === 'Home' && <HomeScreen />}
        {tab === 'Articles' && <ArticlesScreen />}
        {tab === 'Calendar' && <CalendarJournalScreen />}
        {tab === 'Chat' && <PeriodChatScreen />}
        {tab === 'Admin' && <AdminScreen />}
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

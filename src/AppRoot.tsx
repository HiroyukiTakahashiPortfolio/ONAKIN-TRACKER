// src/AppRoot.tsx
import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import useAppState, { AppStateProvider } from './state/useAppState';
import styles from './ui/styles';

// screens
import HomeScreen from './screens/HomeScreen';
import ArticlesScreen from './screens/ArticlesScreen';
import CalendarScreen from './screens/CalendarScreen';
// import ChatScreen from './screens/ChatScreen'; // ← 使わないのでコメントアウト
import AdminScreen from './screens/AdminScreen';
import PeriodChatScreen from './screens/PeriodChatScreen';

export default function AppRoot() {
  return (
    <AppStateProvider>
      <InnerApp />
    </AppStateProvider>
  );
}

function InnerApp() {
  const insets = useSafeAreaInsets();
  const { tab, setTab, title, elapsedDays, user } = useAppState();

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
            <Pressable
              key={it.key}
              onPress={() => setTab(it.key)}
              style={({ pressed }) => [
                styles.tabBtn,
                active && styles.tabBtnActive,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{it.label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {user ? `${user.name} のオナ禁トラッカー` : 'オナ禁トラッカー'}
        </Text>
        <Text style={styles.subtitle}>
          称号: <Text style={styles.bold}>{title}</Text>／ 経過: <Text style={styles.bold}>{elapsedDays}</Text>日
        </Text>
      </View>

      {/* 画面本体 */}
      <View style={{ flex: 1 }}>
        {tab === 'Home' && <HomeScreen />}
        {tab === 'Articles' && <ArticlesScreen />}
        {tab === 'Calendar' && <CalendarScreen />}
        {/* {tab === 'Chat' && <ChatScreen />} ← 旧 */}
        {tab === 'Chat' && <PeriodChatScreen />} {/* 新チャット画面 */}
        {tab === 'Admin' && <AdminScreen />}
      </View>

      {/* 下タブ */}
      <TabBar />
    </SafeAreaView>
  );
}

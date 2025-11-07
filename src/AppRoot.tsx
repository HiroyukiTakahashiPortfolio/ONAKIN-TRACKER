// src/AppRoot.tsx
import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useAppState, { AppStateProvider } from './state/useAppState';
import styles from './ui/styles';
import HomeScreen from './screens/HomeScreen';
import ArticlesScreen from './screens/ArticlesScreen';
import CalendarScreen from './screens/CalendarScreen';
import ChatScreen from './screens/ChatScreen';
import AdminScreen from './screens/AdminScreen';

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
            <View
              key={it.key}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onTouchEnd={() => setTab(it.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{it.label}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>{user ? `${user.name} のオナ禁トラッカー` : 'オナ禁トラッカー'}</Text>
        <Text style={styles.subtitle}>
          称号: <Text style={styles.bold}>{title}</Text>／ 経過: <Text style={styles.bold}>{elapsedDays}</Text>日
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'Home' && <HomeScreen />}
        {tab === 'Articles' && <ArticlesScreen />}
        {tab === 'Calendar' && <CalendarScreen />}
        {tab === 'Chat' && <ChatScreen />}
        {tab === 'Admin' && <AdminScreen />}
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

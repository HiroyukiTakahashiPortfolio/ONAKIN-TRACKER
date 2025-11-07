import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notifications from '../lib/notifications';
import dayjs from '../lib/dayjs';
import { STORAGE } from './storage';
import { User, JournalEntry, ChatMessage } from './types';
import { titleForDays } from '../constants/phases';

type Tab = 'Home' | 'Articles' | 'Calendar' | 'Chat' | 'Admin';

const AppStateContext = React.createContext<any>(null);
export default function useAppState() {
  return React.useContext(AppStateContext);
}

// Provider（AppRootから利用）
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const value = useProvideAppState();
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// 実装
function useProvideAppState() {
  const [user, setUser] = React.useState<User | null>(null);
  const [journal, setJournal] = React.useState<Record<string, JournalEntry>>({});
  const [chat, setChat] = React.useState<ChatMessage[]>([]);
  const [tab, setTab] = React.useState<Tab>('Home');

  React.useEffect(() => {
    (async () => {
      const [uRaw, jRaw, cRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE.USER),
        AsyncStorage.getItem(STORAGE.JOURNAL),
        AsyncStorage.getItem(STORAGE.CHAT),
      ]);
      if (uRaw) setUser(JSON.parse(uRaw));
      if (jRaw) setJournal(JSON.parse(jRaw));
      if (cRaw) setChat(JSON.parse(cRaw));

      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') await Notifications.requestPermissionsAsync();
      } catch {}
    })();
  }, []);

  const today = dayjs().format('YYYY-MM-DD');
  const elapsedDays = React.useMemo(() => {
    if (!user) return 0;
    const diff = dayjs().diff(dayjs(user.registeredAt, 'YYYY-MM-DD'), 'day');
    return Math.max(1, diff + 1);
  }, [user]);

  const title = React.useMemo(() => titleForDays(elapsedDays), [elapsedDays]);

  const persistAll = React.useCallback(async (u = user, j = journal, c = chat) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE.USER, JSON.stringify(u)),
      AsyncStorage.setItem(STORAGE.JOURNAL, JSON.stringify(j)),
      AsyncStorage.setItem(STORAGE.CHAT, JSON.stringify(c)),
    ]);
  }, [user, journal, chat]);

  const register = React.useCallback(async (name: string) => {
    const u: User = { id: 'me', name: name.trim() || '俺', registeredAt: today };
    setUser(u);
    await persistAll(u);
  }, [persistAll, today]);

  const resetCounter = React.useCallback(async () => {
    if (!user) return;
    const u = { ...user, registeredAt: today };
    setUser(u);
    await persistAll(u);
  }, [user, persistAll, today]);

  const saveJournal = React.useCallback(async (date: string, note: string) => {
    const next = { ...journal, [date]: { date, note } };
    setJournal(next);
    await persistAll(user, next, chat);
  }, [journal, persistAll, user, chat]);

  const sendChat = React.useCallback(async (room: string, text: string) => {
    if (!user) return;
    if (user.banned) return;
    const now = Date.now();
    const lastMine = chat.filter(m => m.userId === user.id).sort((a,b)=>b.createdAt-a.createdAt)[0];
    if (user.muted) return;
    if (lastMine && now - lastMine.createdAt < 60_000) return;
    const msg: ChatMessage = { id: `${now}`, room, userId: user.id, name: user.name, text: text.trim(), createdAt: now };
    const next = [...chat, msg];
    setChat(next);
    await persistAll(user, journal, next);
  }, [user, chat, persistAll, journal]);

  const hideMessage = React.useCallback(async (id: string) => {
    const next = chat.map(m => (m.id === id ? { ...m, hidden: true } : m));
    setChat(next);
    await persistAll(user, journal, next);
  }, [chat, persistAll, user, journal]);

  const clearHidden = React.useCallback(async () => {
    const next = chat.map(m => ({ ...m, hidden: false }));
    setChat(next);
    await persistAll(user, journal, next);
  }, [chat, persistAll, user, journal]);

  const setBanned = React.useCallback(async (b: boolean) => {
    if (!user) return;
    const u = { ...user, banned: b };
    setUser(u);
    await persistAll(u, journal, chat);
  }, [user, persistAll, journal, chat]);

  const setMuted = React.useCallback(async (m: boolean) => {
    if (!user) return;
    const u = { ...user, muted: m };
    setUser(u);
    await persistAll(u, journal, chat);
  }, [user, persistAll, journal, chat]);

  return {
    // state
    user, journal, chat, tab, setTab,
    // derived
    elapsedDays, title, today,
    // actions
    register, resetCounter, saveJournal, sendChat,
    hideMessage, clearHidden, setBanned, setMuted,
  };
}

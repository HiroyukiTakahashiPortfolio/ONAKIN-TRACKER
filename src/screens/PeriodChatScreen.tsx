// src/screens/PeriodChatScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';
import useAppState from '../state/useAppState';
import { getRoomForDays, joinRoom, Room } from '../lib/rooms';

type Msg = {
  id: number;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { display_name: string | null };
};

export default function PeriodChatScreen() {
  const { elapsedDays } = useAppState(); // 既存の経過日数
  const [room, setRoom] = useState<Room | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<Msg>>(null);

  // SupabaseのユーザーID取得
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
  }, []);

  // 期間に合う部屋を取得して入室
  useEffect(() => {
    (async () => {
      if (uid == null) return;
      setLoading(true);
      const r = await getRoomForDays(elapsedDays);
      if (!r) {
        setLoading(false);
        return;
      }
      setRoom(r);
      await joinRoom(r.id, uid);

      // 直近50件を取得
      const { data } = await supabase
        .from('messages')
        .select('id, room_id, user_id, content, created_at, profiles(display_name)')
        .eq('room_id', r.id)
        .order('created_at', { ascending: true })
        .limit(50);
      setMsgs(data ?? []);
      setLoading(false);

      // 以降の新着を購読
      const ch = supabase
        .channel(`room-${r.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${r.id}` },
          (payload: any) => {
            const row = payload.new as Msg;
            setMsgs((prev) => [...prev, row]);
            // 自動スクロール
            requestAnimationFrame(() => {
              listRef.current?.scrollToEnd({ animated: true });
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(ch);
      };
    })();
  }, [elapsedDays, uid]);

  async function send() {
    if (!room || !uid || !input.trim()) return;
    const text = input.trim().slice(0, 2000);
    const { error } = await supabase
      .from('messages')
      .insert({ room_id: room.id, user_id: uid, content: text });
    if (!error) setInput('');
  }

  const header = useMemo(
    () => (room ? `${room.label}（同期間のメンバーと交流）` : '入室準備中…'),
    [room]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0b1220' }}>
      <Text style={{ color: 'white', fontWeight: '800', padding: 12 }}>{header}</Text>

      <FlatList
        ref={listRef as any}
        data={msgs}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>
              {item.profiles?.display_name ?? '名無し'} ・ {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text style={{ color: 'white', fontSize: 16 }}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: '#64748b', padding: 12 }}>最初のメッセージを送ってみよう。</Text>
          ) : null
        }
      />

      {/* 入力欄 */}
      <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="メッセージを入力"
          placeholderTextColor="#94a3b8"
          style={{
            flex: 1,
            backgroundColor: '#0f172a',
            color: 'white',
            padding: 12,
            borderRadius: 10,
          }}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable
          onPress={send}
          style={{
            backgroundColor: '#334155',
            paddingHorizontal: 16,
            borderRadius: 10,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>送信</Text>
        </Pressable>
      </View>
    </View>
  );
}

// src/screens/PeriodChatScreen.tsx（送信直後に即表示する版）
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';
import useAppState from '../state/useAppState';
import { getRoomForDays, joinRoom, Room } from '../lib/rooms';

type Msg = {
  id: number;                // DB確定後は正のid、楽観的は負のid
  room_id: string;
  user_id: string;
  content: string | null;
  created_at: string;
};

export default function PeriodChatScreen() {
  const { elapsedDays } = useAppState();
  const [room, setRoom] = useState<Room | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<Msg>>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null)); }, []);

  useEffect(() => {
    (async () => {
      if (!uid) return;
      setLoading(true);

      const r = await getRoomForDays(elapsedDays);
      if (!r) { setLoading(false); return; }
      setRoom(r);

      try { await joinRoom(r.id, uid); } catch {}

      const { data } = await supabase
        .from('messages')
        .select('id, room_id, user_id, content, created_at')
        .eq('room_id', r.id)
        .order('created_at', { ascending: true })
        .limit(50);

      setMsgs(data ?? []);
      setLoading(false);

      const ch = supabase
        .channel(`room-${r.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${r.id}` },
          (payload) => {
            const row = payload.new as Msg;
            setMsgs(prev => {
              // すでに同じidがあれば重複しない
              if (prev.some(m => m.id === row.id)) return prev;
              // 同時刻の楽観的メッセージ(負id)があれば置き換え
              const idx = prev.findIndex(m =>
                m.id < 0 && m.user_id === row.user_id && Math.abs(new Date(m.created_at).getTime() - new Date(row.created_at).getTime()) < 2000
              );
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = row;
                return next;
              }
              return [...prev, row];
            });
            requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(ch); };
    })();
  }, [elapsedDays, uid]);

  async function send() {
    if (!room || !uid || !input.trim()) return;
    const content = input.trim().slice(0, 2000);

    // 1) 楽観的に即表示（負の一時ID）
    const temp: Msg = {
      id: -Date.now(),
      room_id: room.id,
      user_id: uid,
      content,
      created_at: new Date().toISOString(),
    };
    setMsgs(prev => [...prev, temp]);
    setInput('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    // 2) DBに挿入し、確定レコードで置き換え
    const { data, error } = await supabase
      .from('messages')
      .insert({ room_id: room.id, user_id: uid, content })
      .select('id, room_id, user_id, content, created_at')
      .single();

    if (error || !data) {
      // エラー時は一時表示を取り消す
      setMsgs(prev => prev.filter(m => m.id !== temp.id));
      console.error('[CHAT] insert error', error);
      return;
    }
    // 一時IDのものを正式レコードに差し替え
    setMsgs(prev => {
      const idx = prev.findIndex(m => m.id === temp.id);
      if (idx < 0) return prev;
      const next = [...prev];
      next[idx] = data as Msg;
      return next;
    });
  }

  const header = useMemo(() => (room ? `${room.label}（同期間のメンバーと交流）` : '入室準備中…'), [room]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <Text style={{ color: '#1e293b', fontWeight: '800', padding: 12, fontSize: 16 }}>{header}</Text>

      <FlatList
        ref={listRef as any}
        data={msgs}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 12 }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text style={{ color: '#0f172a', fontSize: 16 }}>
              {item.content ?? ''}
              {item.id < 0 ? ' （送信中…）' : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={!loading ? (
          <Text style={{ color: '#94a3b8', padding: 12 }}>最初のメッセージを送ってみよう。</Text>
        ) : null}
      />

      <View style={{ flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#cbd5e1', backgroundColor: 'white' }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="メッセージを入力"
          placeholderTextColor="#94a3b8"
          style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#0f172a', padding: 12, borderRadius: 10 }}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable onPress={send} style={{ backgroundColor: '#0ea5e9', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>送信</Text>
        </Pressable>
      </View>
    </View>
  );
}

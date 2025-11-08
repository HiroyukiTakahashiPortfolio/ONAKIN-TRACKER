// src/lib/rooms.ts
import { supabase } from './supabase';

export type Room = {
  id: string;
  code: string;
  label: string;
  min_days: number;
  max_days: number | null;
};

export async function getRoomForDays(days: number): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('min_days', { ascending: true });

  if (error || !data) return null;
  return (
    data.find(
      (r) => days >= r.min_days && (r.max_days === null || days <= r.max_days)
    ) ?? null
  );
}

export async function joinRoom(roomId: string, userId: string) {
  // 既存所属をクリアして入室
  await supabase.from('room_members').delete().eq('user_id', userId);
  const { error } = await supabase
    .from('room_members')
    .insert({ room_id: roomId, user_id: userId });
  if (error) throw error;
}

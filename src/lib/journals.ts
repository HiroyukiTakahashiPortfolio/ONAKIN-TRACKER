import { supabase } from '../lib/supabase';

export type Journal = {
  id: string;
  user_id: string;
  date: string;   // 'YYYY-MM-DD'
  note: string;
  created_at: string;
  updated_at: string;
};

async function getUid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not signed in');
  return user.id;
}

/** 当日分を upsert（存在すれば更新） */
export async function upsertJournal(dateISO: string, note: string) {
  const uid = await getUid();
  const { error } = await supabase
    .from('journals')
    .upsert(
      { user_id: uid, date: dateISO.slice(0,10), note: note.trim() },
      { onConflict: 'user_id,date' }
    );
  if (error) throw error;
}

/** 月単位で取得（カレンダー用ドット表示） */
export async function fetchJournalsByMonth(year: number, month1to12: number): Promise<Journal[]> {
  const uid = await getUid();
  const m = String(month1to12).padStart(2, '0');
  const from = `${year}-${m}-01`;
  const to = new Date(year, month1to12, 0).toISOString().slice(0,10); // 月末
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('user_id', uid)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Journal[];
}

/** 直近N件（履歴リスト用） */
export async function fetchRecentJournals(limit = 30): Promise<Journal[]> {
  const uid = await getUid();
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('user_id', uid)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Journal[];
}

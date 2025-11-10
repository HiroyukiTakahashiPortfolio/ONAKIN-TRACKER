// src/actions/ensureStreakStart.ts
import { supabase } from '../lib/supabase';

/**
 * 開始ISOを保証して返す。
 * - user_settings 行が無ければ upsert で作成
 * - streak_started_at が null なら server_now() を入れて返す
 * - 既に値があればそのまま返す
 */
export default async function ensureStreakStart(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 自分の設定行を必ず用意
  await supabase
    .from('user_settings')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' });

  // 既存値を確認
  const { data: s, error: selErr } = await supabase
    .from('user_settings')
    .select('streak_started_at')
    .eq('user_id', user.id)
    .single();
  if (selErr) {
    console.warn('user_settings select error', selErr);
  }

  if (s?.streak_started_at) {
    return s.streak_started_at as string;
  }

  // 無ければ server_now() で埋める
  const { data: nowISO, error: nowErr } = await supabase.rpc('server_now');
  if (nowErr) {
    console.warn('server_now rpc error', nowErr);
    // 最悪のフォールバック（端末時刻） — できれば通らせたくない
    const fallback = new Date().toISOString();
    await supabase.from('user_settings')
      .update({ streak_started_at: fallback })
      .eq('user_id', user.id);
    return fallback;
  }

  await supabase
    .from('user_settings')
    .update({ streak_started_at: nowISO })
    .eq('user_id', user.id);

  return nowISO as string;
}

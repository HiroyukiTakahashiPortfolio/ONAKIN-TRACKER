import { supabase } from '../lib/supabase';

/**
 * リセット：
 * - server_now() を取得して user_settings.streak_started_at に更新
 * - 更新した ISO を返す（UI側はこれを setStartISO へ渡せば秒が即0に）
 */
export default async function resetStreak(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: nowISO, error } = await supabase.rpc('server_now');
  if (error) throw error;

  const { error: upErr } = await supabase
    .from('user_settings')
    .update({ streak_started_at: nowISO })
    .eq('user_id', user.id);
  if (upErr) throw upErr;

  // 任意：履歴を残したい場合
  // await supabase.from('reset_logs').insert({ user_id: user.id, reset_at: nowISO }).catch(()=>{});

  return nowISO as string;
}

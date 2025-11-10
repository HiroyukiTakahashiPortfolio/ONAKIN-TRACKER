import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * startISO（秒カウントの基準）を用意して返すカスタムフック。
 * - profiles / user_settings に自分の行を upsert
 * - user_settings.streak_started_at が無ければ server_now() を入れる
 */
export default function useStartTime() {
  const [startISO, setStartISO] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStartISO(null);
        return;
      }

      // FKを満たすために profiles と user_settings の行を必ず作る
      await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });
      await supabase.from('user_settings').upsert({ user_id: user.id }, { onConflict: 'user_id' });

      // 既存の開始ISOを読む
      const { data: s, error: selErr } = await supabase
        .from('user_settings')
        .select('streak_started_at')
        .eq('user_id', user.id)
        .single();

      if (selErr) {
        console.warn('user_settings select error', selErr);
        setStartISO(null);
        return;
      }

      if (s?.streak_started_at) {
        setStartISO(s.streak_started_at as string);
        return;
      }

      // まだ無いので server_now で初期化
      const { data: nowISO, error: nowErr } = await supabase.rpc('server_now');
      if (nowErr) {
        console.warn('server_now rpc error', nowErr);
        const fallback = new Date().toISOString();
        await supabase.from('user_settings').update({ streak_started_at: fallback }).eq('user_id', user.id);
        setStartISO(fallback);
        return;
      }

      await supabase.from('user_settings').update({ streak_started_at: nowISO }).eq('user_id', user.id);
      setStartISO(nowISO as string);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { startISO, setStartISO, reloadStartISO: load, loading };
}

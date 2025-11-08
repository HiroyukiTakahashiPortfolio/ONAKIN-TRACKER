import { supabase } from './supabase';

type LinkPayload = {
  email: string;          // ユーザー入力
  password?: string;      // 使うなら
  displayName: string;    // 既存 user.name
  registeredAtISO?: string; // 既存 user.registeredAt をISOで渡す（なければ省略）
};

/** 既存ローカルユーザーを Supabase にリンクする */


export async function linkSupabaseAccountFromLocal(p: {
  email: string;
  password?: string;
  displayName: string;
  registeredAtISO?: string;
}) {
  const password = p.password ?? 'TempPassw0rd!';

  // ① まず既存アカウントにログインを試みる
  let signin = await supabase.auth.signInWithPassword({
    email: p.email,
    password,
  });

  // ② 存在しない or パスワード不一致 → 新規作成
  if (signin.error) {
    const { error: upErr } = await supabase.auth.signUp({
      email: p.email,
      password,
    });
    if (upErr) throw upErr;

    // サインアップ直後に再ログイン
    signin = await supabase.auth.signInWithPassword({
      email: p.email,
      password,
    });
    if (signin.error) throw signin.error;
  }

  const uid = signin.data.user?.id;
  if (!uid) throw new Error('SupabaseユーザーIDを取得できません');

  // ③ プロフィール登録（profilesテーブル）
  const payload: any = { id: uid, display_name: p.displayName };
  if (p.registeredAtISO) payload.registered_at = p.registeredAtISO;

  const { error: profErr } = await supabase.from('profiles').upsert(payload);
  if (profErr) throw profErr;

  return uid;
}


/** 以降の起動で、すでにSupabaseログインしてるかチェック */
export async function getSupabaseUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function signOutSupabase() {
  await supabase.auth.signOut();
}

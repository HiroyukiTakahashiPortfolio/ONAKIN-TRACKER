// src/lib/auth.ts
import { supabase } from './supabase';

/** 現在ログイン中の Supabase ユーザーID（なければ null） */
export async function getSupabaseUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * 既存ローカルユーザーを Supabase に紐づける。
 * mode: 'signin'（既存でログイン） or 'signup'（新規→ログイン）
 */
export async function linkSupabaseAccountFromLocal(p: {
  email: string;
  password?: string;
  displayName: string;
  registeredAtISO?: string;
  mode: 'signin' | 'signup';
}) {
  const password = p.password ?? 'TempPassw0rd!';

  if (p.mode === 'signup') {
    const { error: signUpErr } = await supabase.auth.signUp({
      email: p.email,
      password,
    });
    if (signUpErr) throw signUpErr;
  }

  const signin = await supabase.auth.signInWithPassword({
    email: p.email,
    password,
  });
  if (signin.error) throw signin.error;

  const uid = signin.data.user?.id;
  if (!uid) throw new Error('SupabaseユーザーIDを取得できません');

  // プロフィールを upsert
  const payload: any = { id: uid, display_name: p.displayName };
  if (p.registeredAtISO) payload.registered_at = p.registeredAtISO;

  const { error: profErr } = await supabase.from('profiles').upsert(payload);
  if (profErr) throw profErr;

  return uid;
}

/** Supabaseからログアウトしてローカル状態もクリア */
export async function logoutSupabase() {
  await supabase.auth.signOut();
}

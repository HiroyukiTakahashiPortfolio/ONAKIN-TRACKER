import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// SDKやプラットフォーム差異を吸収して extra を拾う
const extra =
  (Constants?.expoConfig?.extra as any) ??
  // 一部環境の互換（古いmanifest系）
  ((Constants as any)?.manifest?.extra) ??
  {};

const supabaseUrl: string =
  extra.EXPO_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string =
  extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// デバッグ用（1回だけ確認したら消してOK）
console.log('SB URL', supabaseUrl ? 'OK' : 'MISSING');
console.log('SB KEY', supabaseAnonKey ? 'OK' : 'MISSING');

if (!supabaseUrl) throw new Error('supabaseUrl is required.');
if (!supabaseAnonKey) throw new Error('supabaseAnonKey is required.');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

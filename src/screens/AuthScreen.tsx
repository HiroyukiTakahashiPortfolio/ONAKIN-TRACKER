// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import styles from '../ui/styles';
import useAppState from '../state/useAppState';
import PrimaryButton from '../components/PrimaryButton';
import { linkSupabaseAccountFromLocal } from '../lib/auth';

export default function AuthScreen() {
  const { user, register } = useAppState();

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  const inputStyle = {
    borderWidth: 1 as const,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    color: '#e2e8f0',
    height: 40,
    fontSize: 14,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  };

  async function ensureLocalProfile() {
    if (user) return;
    if (!displayName.trim()) {
      alert('ニックネームを入力してください');
      return;
    }
    await register(displayName.trim());
  }

  async function handleEnableOnline() {
    try {
      setBusy(true);
      await ensureLocalProfile();
      const current = user ?? { name: displayName.trim(), registeredAt: new Date().toISOString() };
      if (!email.trim()) {
        alert('メールアドレスを入力してください');
        return;
      }
      await linkSupabaseAccountFromLocal({
        email: email.trim(),
        password: pw || undefined,
        displayName: current.name,
        registeredAtISO: current.registeredAt,
      });
      // 成功すると AppRoot 側の auth 監視が authed に切り替え、本体が表示される
    } catch (e: any) {
      alert(`ログイン/作成に失敗: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.modalSafe, { gap: 8 }]}>
      <Text style={styles.modalTitle}>オンライン機能にサインイン</Text>
      <Text style={{ marginBottom: 8, opacity: 0.8 }}>
        チャットなどのオンライン機能を使うには、メール認証が必要です。
      </Text>

      {/* ローカルのニックネーム（未登録なら表示） */}
      {!user && (
        <>
          <Text style={{ fontWeight: '700', marginTop: 4 }}>ニックネーム（アプリ内表示名）</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="例: オナ禁スカイウオーカー"
            style={inputStyle}
          />
        </>
      )}

      {/* Supabase の資格情報 */}
      <Text style={{ fontWeight: '700', marginTop: 8 }}>メールアドレス</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        style={inputStyle}
      />
      <Text style={{ fontWeight: '700' }}>パスワード（新規作成 or 既存ログイン）</Text>
      <TextInput
        value={pw}
        onChangeText={setPw}
        placeholder="8文字以上推奨"
        secureTextEntry
        autoCapitalize="none"
        style={inputStyle}
      />

      <PrimaryButton label={busy ? '処理中…' : 'オンライン機能を有効化'} onPress={handleEnableOnline} disabled={busy} />

      <Text style={[styles.muted, { marginTop: 8 }]}>
        ※ 既存アカウントがあればログイン、新規なら自動で作成されます。
      </Text>
    </View>
  );
}

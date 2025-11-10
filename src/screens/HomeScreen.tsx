// src/screens/HomeScreen.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, TextInput, Alert } from 'react-native';
import styles from '../ui/styles';
import useAppState from '../state/useAppState';
import dayjs from '../lib/dayjs';
import PrimaryButton from '../components/PrimaryButton';
import RecommendedArticles from '../components/RecommendedArticles';
import { unlockedArticles } from '../constants/articles';
import { titleForDays } from '../constants/phases';
import { recommendedFor } from '../constants/recommended';
import { TodayTipsRow } from '../components/TodayTipsRow';
import { supabase } from '../lib/supabase';

/* ----------------------------------------------------------------
  1) Supabase 連携：開始時刻（streak_started_at）を用意＆取得
     - 初回: profiles.created_at を user_settings.streak_started_at にコピー
     - 以降: user_settings.streak_started_at を読む
----------------------------------------------------------------- */
async function ensureStreakStart(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // user_settings.streak_started_at を確認
  const { data: s, error: sErr } = await supabase
    .from('user_settings')
    .select('streak_started_at')
    .eq('user_id', user.id)
    .single();

  if (sErr && sErr.code !== 'PGRST116') {
    // PGRST116 = no rows
    console.warn('user_settings fetch error', sErr);
  }

  // 既にあるならそれを使う
  if (s?.streak_started_at) {
    return s.streak_started_at as string;
  }

  // 未設定なら profiles.created_at をコピー
  const { data: p, error: pErr } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', user.id)
    .single();
  if (pErr) {
    console.warn('profiles fetch error', pErr);
  }

  const seed = p?.created_at ?? new Date().toISOString();
  const { error: upErr } = await supabase
    .from('user_settings')
    .update({ streak_started_at: seed })
    .eq('user_id', user.id);
  if (upErr) {
    console.warn('user_settings update error', upErr);
  }
  return seed;
}

/* ----------------------------------------------------------------
  2) Supabase 連携：リセット（server_now を開始時刻に反映）
----------------------------------------------------------------- */
async function resetStreakOnServer(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: nowISO, error } = await supabase.rpc('server_now');
  if (error) throw error;

  const { error: upErr } = await supabase
    .from('user_settings')
    .update({ streak_started_at: nowISO })
    .eq('user_id', user.id);
  if (upErr) throw upErr;

  // 履歴（任意）
  const { error: logErr } = await supabase
    .from('reset_logs').insert({ user_id: user.id, reset_at: nowISO });
  if (logErr) console.warn('reset_logs insert warn', logErr);

  return nowISO as string;
}

/* ----------------------------------------------------------------
  3) 経過タイマー: startAtISO から "日・時間・分・秒" と HH:MM:SS を1秒ごと再計算
----------------------------------------------------------------- */
function useElapsedSince(startAtISO?: string | null) {
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!startAtISO) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hms: '00:00:00', label: '0日 0時間 0分 0秒' };
  }
  const start = new Date(startAtISO).getTime();
  const diffSec = Math.max(0, Math.floor((now - start) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const totalHours = hours + days * 24;
  return {
    days,
    hours,
    minutes,
    seconds,
    hms: `${pad2(totalHours)}:${pad2(minutes)}:${pad2(seconds)}`,
    label: `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`,
  };
}

export default function HomeScreen() {
  const { user, register, resetCounter, elapsedDays } = useAppState();

  // ローカル登録モーダル（これはアプリ内プロフィール用。オンライン認証とは無関係）
  const [open, setOpen] = useState(!user);
  const [name, setName] = useState('');
  const [adviceOpen, setAdviceOpen] = useState(false);

  // Supabase 開始時刻（秒カウントの基準）
  const [startISO, setStartISO] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const iso = await ensureStreakStart();
        if (iso) setStartISO(iso);
      } catch (e) {
        console.warn('ensureStreakStart error', e);
      }
    })();
  }, []);

  // 直近で解禁された記事を1つだけ抽出（リセット直後に表示）
  const advice = useMemo(
    () => unlockedArticles(elapsedDays).slice(-1)[0],
    [elapsedDays]
  );

  // 称号ラベルとレコメンド
  const stageLabel = titleForDays(elapsedDays);
  const recos = recommendedFor(elapsedDays);

  // 経過 時:分:秒（Supabase streak_started_at 基準）
  const elapsed = useElapsedSince(startISO);

  const compactInput = {
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

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* ローカル登録モーダル（※オンライン認証は AuthScreen 側） */}
      <Modal visible={open} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalSafe}>
          <Text style={styles.modalTitle}>ユーザー登録</Text>
          <Text style={{ marginBottom: 8 }}>名前を入力してください（後で変更可）</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="例: オナ禁スカイウオーカー"
            style={compactInput}
          />
          <PrimaryButton
            label="登録する"
            onPress={async () => {
              await register(name.trim());
              setOpen(false);
              // ログイン直後に Supabase の開始時刻も整合（profiles.created_at が変わるわけではないが初期コピーを保証）
              try {
                const iso = await ensureStreakStart();
                if (iso) setStartISO(iso);
              } catch {}
            }}
          />
          <Text style={[styles.muted, { marginTop: 12 }]}>
            ※ 登録日は本日（{dayjs().format('YYYY/MM/DD')}）として保存されます。
          </Text>
        </View>
      </Modal>

      {/* ランク & 経過日数 & リセット */}
      <View style={[styles.card, { alignItems: 'center' }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.rankBadge}>{stageLabel}</Text>
          {user && (
            <Text style={styles.rankSub}>
              登録日: {dayjs(user.registeredAt).format('YYYY/MM/DD')}
            </Text>
          )}
        </View>

        {/* 既存：経過「日」 */}
        <Text style={styles.daysBig}>{elapsedDays}</Text>
        <Text style={styles.daysLabel}>日 経過</Text>

        {/* 追加：経過「時間・分・秒」（総時間も併記） */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ textAlign: 'center', opacity: 0.85 }}>
            （{elapsed.label} / {elapsed.hms}）
          </Text>
        </View>

        <View style={{ height: 8 }} />
        <PrimaryButton
  label="リセット（やり直し）"
  onPress={async () => {
    try {
      // 1) Supabase の開始時刻を server_now で更新（ISO受け取り）
      const iso = await resetStreakOnServer();
      if (iso) setStartISO(iso);      // 秒カウント用の表示を即更新

      // 2) ローカル状態も同じISOで更新（←ココが肝）
      await resetCounter(iso ?? undefined);

      setAdviceOpen(true);
    } catch (e) {
      console.warn(e);
      Alert.alert('エラー', 'リセットに失敗しました。通信状況をご確認ください。');
    }
  }}
/>
      </View>

      {/* リセット直後アドバイス */}
      <Modal
        visible={adviceOpen}
        animationType="slide"
        onRequestClose={() => setAdviceOpen(false)}
      >
        <View style={styles.modalSafe}>
          <Text style={styles.modalTitle}>リセットしました</Text>
          {advice ? (
            <>
              <Text style={{ fontWeight: '800', marginBottom: 8 }}>{advice.title}</Text>
              <Text style={styles.articleText}>{advice.content}</Text>
            </>
          ) : (
            <Text>まずは1日から一緒に積み上げよう。</Text>
          )}
          <PrimaryButton label="OK" onPress={() => setAdviceOpen(false)} />
        </View>
      </Modal>

      {/* おすすめ記事（外部ブログ） */}
      <RecommendedArticles stageLabel={stageLabel} items={recos} />

      {/* 三段目：今日のひとこと（横3カード） */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>今日のひとこと</Text>
        <TodayTipsRow currentTitle={stageLabel} />
      </View>

      {/* 今読むと効く記事（アプリ内テキスト。解禁分のみ） */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>今読むと効く記事</Text>
        {unlockedArticles(elapsedDays).map((a) => (
          <View key={a.id} style={styles.articleRow}>
            <Text style={{ fontWeight: '800' }}>{a.title}</Text>
            <Text style={styles.articleText}>{a.content}</Text>
          </View>
        ))}
        {unlockedArticles(elapsedDays).length === 0 && (
          <Text style={styles.muted}>まだ記事は解禁されていません。</Text>
        )}
      </View>
    </ScrollView>
  );
}

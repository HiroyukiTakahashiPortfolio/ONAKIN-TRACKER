// src/screens/HomeScreen.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, TextInput } from 'react-native';
import styles from '../ui/styles';
import useAppState from '../state/useAppState';
import dayjs from '../lib/dayjs';
import PrimaryButton from '../components/PrimaryButton';
import RecommendedArticles from '../components/RecommendedArticles';
import { unlockedArticles } from '../constants/articles';
import { titleForDays } from '../constants/phases';
import { recommendedFor } from '../constants/recommended';
import { TodayTipsRow } from '../components/TodayTipsRow';

// ← ここがポイント：importはファイル先頭で！
import { getSupabaseUserId, linkSupabaseAccountFromLocal } from '../lib/auth';

export default function HomeScreen() {
  const { user, register, resetCounter, elapsedDays } = useAppState();

  const [open, setOpen] = useState(!user);
  const [name, setName] = useState('');
  const [adviceOpen, setAdviceOpen] = useState(false);

  // Supabaseリンク用の状態
  const [linkOpen, setLinkOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  // クールダウン・処理中状態
const [linkPending, setLinkPending] = useState(false);
const [cooldown, setCooldown] = useState(0);

  // ローカルユーザーがいる & まだSupabase未ログインならリンクモーダルを出す
  useEffect(() => {
    (async () => {
      if (!user) return;
      const supaUid = await getSupabaseUserId();
      if (!supaUid) setLinkOpen(true);
    })();
  }, [user]);

async function linkNow() {
  if (!user || linkPending || cooldown > 0) return;
  try {
    setLinkPending(true);
    await linkSupabaseAccountFromLocal({
      email: email.trim(),
      password: pw || undefined,
      displayName: user.name,
      registeredAtISO: user.registeredAt,
    });
    setLinkOpen(false);
    alert('オンライン機能が有効化されました！');
  } catch (e: any) {
    // レート制限(429)などの待機秒数を検出
    const msg = String(e?.message ?? '');
    const m = msg.match(/after (\d+) seconds?/i);
    if (m) {
      const sec = Number(m[1] || 60);
      setCooldown(sec);
      const timer = setInterval(() => {
        setCooldown((s) => {
          if (s <= 1) {
            clearInterval(timer);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      alert(`リンク失敗: ${msg}`);
    }
  } finally {
    setLinkPending(false);
  }
}

  // 直近で解禁された記事を1つだけ抽出（リセット直後に表示）
  const advice = useMemo(
    () => unlockedArticles(elapsedDays).slice(-1)[0],
    [elapsedDays]
  );

  // 称号ラベルとレコメンド
  const stageLabel = titleForDays(elapsedDays);
  const recos = recommendedFor(elapsedDays);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Supabaseリンクモーダル */}
      <Modal visible={linkOpen} animationType="fade" onRequestClose={() => {}}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 12 }}>オンライン機能を有効化</Text>
          <Text style={{ marginBottom: 8 }}>チャットなどのオンライン機能を使うには、メールを紐づけます。</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="メールアドレス"
            keyboardType="email-address"
            style={{ borderWidth: 1, padding: 10, marginBottom: 8 }}
          />
          <TextInput
            value={pw}
            onChangeText={setPw}
            placeholder="パスワード（任意）"
            secureTextEntry
            style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
          />
          <PrimaryButton
  label={
    cooldown > 0
      ? `再試行まで ${cooldown}s`
      : linkPending
      ? '処理中...'
      : '有効化する'
  }
  onPress={linkNow}
  disabled={linkPending || cooldown > 0}
/>

          <Text style={{ marginTop: 12, opacity: 0.7 }}>※ 後から設定も可能です</Text>
        </View>
      </Modal>

      {/* 登録モーダル（リンク用モーダルが開いている間は出さない） */}
      <Modal visible={open && !linkOpen} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalSafe}>
          <Text style={styles.modalTitle}>ユーザー登録</Text>
          <Text style={{ marginBottom: 8 }}>名前を入力してください（後で変更可）</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="例: オナ禁スカイウオーカー"
            style={styles.input}
            autoFocus
          />
          <PrimaryButton
            label="登録する"
            onPress={async () => {
              await register(name);
              setOpen(false);
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

        <Text style={styles.daysBig}>{elapsedDays}</Text>
        <Text style={styles.daysLabel}>日 経過</Text>

        <View style={{ height: 8 }} />

        <PrimaryButton
          label="リセット（やり直し）"
          onPress={async () => {
            await resetCounter();
            setAdviceOpen(true);
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

      {/* onakin-blog へのおすすめ記事（解禁分） */}
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

// src/screens/HomeScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Modal, TextInput } from 'react-native';
import styles from '../ui/styles';
import useAppState from '../state/useAppState';
import dayjs from '../lib/dayjs';
import PrimaryButton from '../components/PrimaryButton';
import RecommendedArticles from '../components/RecommendedArticles';
import { unlockedArticles } from '../constants/articles';
import { titleForDays } from '../constants/phases';
import { recommendedFor } from '../constants/recommended';

export default function HomeScreen() {
  const {
    user,
    register,
    resetCounter,
    elapsedDays,
  } = useAppState();

  const [open, setOpen] = useState(!user);
  const [name, setName] = useState('');
  const [adviceOpen, setAdviceOpen] = useState(false);

  const advice = useMemo(
    () => unlockedArticles(elapsedDays).slice(-1)[0],
    [elapsedDays]
  );

  const stageLabel = titleForDays(elapsedDays);
  const recos = recommendedFor(elapsedDays);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 登録モーダル */}
      <Modal visible={open} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalSafe}>
          <Text style={styles.modalTitle}>ユーザー登録</Text>
          <Text style={{ marginBottom: 8 }}>名前を入力してください（後で変更可）</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="例: オナ禁スカイウオーカー"
            style={styles.input}
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

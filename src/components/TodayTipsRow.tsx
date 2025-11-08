// src/components/TodayTipsRow.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";

type Rank = "padawan" | "knight" | "master" | "grand";
type TipKey = "motivation" | "relax" | "detox";

export const TodayTipsRow: React.FC<{ currentTitle: string }> = ({ currentTitle }) => {
  const [open, setOpen] = useState<null | { key: TipKey; text: string }>(null);

  const rank = titleToRank(currentTitle);
  const tips = useMemo(() => HINTS[rank], [rank]);

  const onPress = (key: TipKey) => {
    const choices = tips[key];
    const text = choices[Math.floor(Math.random() * choices.length)];
    setOpen({ key, text });
  };

  return (
    <>
      <View style={styles.row}>
        <TipCard label="モチベUP" emoji="🔥" onPress={() => onPress("motivation")} />
        <TipCard label="リラックス" emoji="🕊️" onPress={() => onPress("relax")} />
        <TipCard label="デジタル断ち" emoji="📱" onPress={() => onPress("detox")} />
      </View>

      <Modal transparent visible={!!open} animationType="fade" onRequestClose={() => setOpen(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {open?.key === "motivation" ? "モチベUP" : open?.key === "relax" ? "リラックス" : "デジタルデトックス"}
            </Text>
            <Text style={styles.tipText}>{open?.text}</Text>
            <Pressable style={styles.closeBtn} onPress={() => setOpen(null)}>
              <Text style={styles.closeTxt}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const HINTS: Record<Rank, Record<TipKey, string[]>> = {
  padawan: {
    motivation: ["最初の3日は勢い。迷う前に手を動かす。", "今日は開いた時点で勝ち。", "寝室とスマホを分離。"],
    relax: ["4-4-8呼吸×3セット。", "風呂→冷水10秒→深呼吸。", "15分散歩、光を浴びる。"],
    detox: ["今から60分は通知オフ。", "ベッドにスマホ持ち込まない。", "ホーム1ページ目を空にする。"],
  },
  knight: {
    motivation: ["時間を決めるが勝ち。", "今日も1ミリ進め。", "朝イチで勝ちを作る。"],
    relax: ["肩胸ストレッチ30秒。", "5分目閉じ瞑想。", "温冷交代シャワー。"],
    detox: ["SNSは2回/日に制限。", "動画は“後で見る”へ。", "就寝90分前はブルーライト遮断。"],
  },
  master: {
    motivation: ["欲求の波は90秒。やり過ごす。", "やらないリスト更新。", "過去の自分に勝つ。"],
    relax: ["5吸って7吐く×5。", "首後ろを温める。", "音なし散歩＝歩行瞑想。"],
    detox: ["SNS通知は全切り。", "ホーム3アプリだけ。", "週次でスクタイをレビュー。"],
  },
  grand: {
    motivation: ["自制は筋トレ。軽く反復。", "環境＞意志。配置を最適化。", "やらない自由がやれる自由を育てる。"],
    relax: ["1分ボディスキャン。", "笑顔10秒で副交感。", "日光・塩・水を意識。"],
    detox: ["週1完全オフライン。", "娯楽端末を分離。", "開く前に目的を言語化。"],
  },
};

function titleToRank(title: string): Rank {
  if (title.includes("グランド")) return "grand";
  if (title.includes("マスター")) return "master";
  if (title.includes("修行者") || title.includes("ジェダイ")) return "knight";
  return "padawan";
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, justifyContent: "space-between", marginTop: 8 },
  card: {
    flex: 1, backgroundColor: "#101622", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 10,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  emoji: { fontSize: 20, marginBottom: 6 },
  label: { color: "white", fontWeight: "600", fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  sheet: {
    width: "86%", backgroundColor: "#0f172a", borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  sheetTitle: { color: "#cbd5e1", fontSize: 12, letterSpacing: 1, marginBottom: 8 },
  tipText: { color: "white", fontSize: 16, lineHeight: 22 },
  closeBtn: {
    marginTop: 16, alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)",
  },
  closeTxt: { color: "white", fontWeight: "600" },
});

const TipCard: React.FC<{ label: string; emoji: string; onPress: () => void }> = ({ label, emoji, onPress }) => (
  <Pressable style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]} onPress={onPress}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

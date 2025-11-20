// src/components/TodayTipsRow.tsx
import React, { useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import useStartTime from "../hooks/useStartTime";
import { tipsForAllCategories } from "../lib/todayTips";

type Category = "motivation" | "relax" | "digital_detox";
type Props = { onNavigate?: (route: string) => void };

const LABELS: Record<Category, string> = {
  motivation: "モチベUP",
  relax: "リラックス",
  digital_detox: "デジタル断ち",
};

// ★ 追加：アイコンマップ（好みで差し替えてOK）
const ICONS: Record<Category, string> = {
  motivation: "🔥",
  relax: "🧘",
  digital_detox: "📵",
};

export default function TodayTipsRow({ onNavigate }: Props) {
  const { startAt } = useStartTime();
  const days = useMemo(() => {
    if (!startAt) return 0;
    const diff = dayjs().diff(dayjs(startAt), "day");
    return diff < 0 ? 0 : diff;
  }, [startAt]);

  const packs = useMemo(() => tipsForAllCategories(days), [days]);

  const [open, setOpen] = useState<Category | null>(null);
  const toggle = useCallback((key: Category) => {
    setOpen(prev => (prev === key ? null : key));
  }, []);

  const Pill = ({ k }: { k: Category }) => (
    <TouchableOpacity
      key={k}
      activeOpacity={0.9}
      onPress={() => toggle(k)}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={{
        flex: 1,
        backgroundColor: open === k ? "#1f2937" : "#0f172a",
        borderWidth: open === k ? 1 : 0,
        borderColor: "#334155",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ← ここでアイコン＋ラベルを横並び表示 */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginRight: 6 }}>{ICONS[k]}</Text>
        <Text style={{ color: "#fff", fontWeight: "700" }}>{LABELS[k]}</Text>
      </View>
    </TouchableOpacity>
  );

  const Detail = ({ k }: { k: Category }) => {
    if (open !== k) return null;
    const tip = packs?.[k] ?? { icon: "💡", title: "", body: "" };
    return (
      <View
        style={{
          marginTop: 10,
          backgroundColor: "#0b1220",
          borderColor: "#1f2937",
          borderWidth: 1,
          borderRadius: 14,
          padding: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontSize: 18, marginRight: 6 }}>{tip.icon ?? ICONS[k]}</Text>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{LABELS[k]}</Text>
          <View
            style={{
              marginLeft: "auto",
              backgroundColor: "#1f2937",
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#e5e7eb", fontSize: 12 }}>{days}日目</Text>
          </View>
        </View>
        <Text style={{ color: "#fff", fontSize: 15, marginBottom: 4 }} numberOfLines={2}>
          {tip.title}
        </Text>
        <Text style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 18 }} numberOfLines={6}>
          {tip.body}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ padding: 16, borderRadius: 16, backgroundColor: "#111827" }}>
      <Text style={{ color: "#fff", fontSize: 16, opacity: 0.85, marginBottom: 12 }}>
        今日のひとこと
      </Text>

      {/* ラベル行（Webのgap非対応対策としてmarginで余白） */}
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, marginRight: 8 }}><Pill k="motivation" /></View>
        <View style={{ flex: 1, marginRight: 8 }}><Pill k="relax" /></View>
        <View style={{ flex: 1 }}><Pill k="digital_detox" /></View>
      </View>

      {/* アコーディオン詳細 */}
      <Detail k="motivation" />
      <Detail k="relax" />
      <Detail k="digital_detox" />
    </View>
  );
}

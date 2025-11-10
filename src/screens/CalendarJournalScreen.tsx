import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import dayjs from '../lib/dayjs';
import styles from '../ui/styles';
import { upsertJournal, fetchJournalsByMonth, Journal } from '../lib/journals';

export default function CalendarJournalScreen() {
  const todayISO = dayjs().format('YYYY-MM-DD');
  const [selected, setSelected] = useState<string>(todayISO);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 今表示している年月
  const [year, setYear] = useState<number>(dayjs().year());
  const [month, setMonth] = useState<number>(dayjs().month() + 1); // 1-12

  // 当月データ
  const [items, setItems] = useState<Record<string, Journal>>({});

  // 月が変わったら取得
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const rows = await fetchJournalsByMonth(year, month);
        const map: Record<string, Journal> = {};
        rows.forEach(r => { map[r.date] = r; });
        setItems(map);
        // 選択してる日の内容を更新
        setNote(map[selected]?.note ?? (selected === todayISO ? '' : ''));
      } catch (e: any) {
        Alert.alert('読み込み失敗', String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    })();
  }, [year, month]);

  // カレンダー印（書いた日にドット）
  const marked = useMemo(() => {
    const marks: Record<string, any> = {};
    Object.keys(items).forEach(d => {
      marks[d] = { marked: true, dotColor: '#0ea5e9' };
    });
    marks[selected] = { ...(marks[selected] || {}), selected: true, selectedColor: '#0ea5e9' };
    return marks;
  }, [items, selected]);

  // 日付タップ
  const onDayPress = (d: DateData) => {
    const iso = d.dateString;
    setSelected(iso);
    setNote(items[iso]?.note ?? '');
  };

  // 月移動
  const onMonthChange = (m: DateData) => {
    setYear(m.year);
    setMonth(m.month);
    // 月変わると selected がその月に無いことがある → 一旦その月1日に寄せてもOK
  };

  // 保存
  const onSave = async () => {
    const text = (note || '').trim();
    try {
      await upsertJournal(selected, text);
      // 楽観更新
      setItems(prev => ({ ...prev, [selected]: {
        id: prev[selected]?.id ?? 'local',
        user_id: 'me',
        date: selected,
        note: text,
        created_at: prev[selected]?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }}));
      Alert.alert('保存しました', '');
    } catch (e: any) {
      Alert.alert('保存失敗', String(e?.message ?? e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={[styles.card, { padding: 0 }]}>
        <Calendar
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          markedDates={marked}
          theme={{
            backgroundColor: 'white',
            calendarBackground: 'white',
            dayTextColor: '#0f172a',
            monthTextColor: '#0f172a',
            arrowColor: '#0ea5e9',
            todayTextColor: '#0ea5e9',
            selectedDayBackgroundColor: '#0ea5e9',
            selectedDayTextColor: 'white',
          }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ひとこと日記（{selected}）</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="今日の気づき・ひとことを残そう"
          placeholderTextColor="#94a3b8"
          style={styles.inputMultiline}
          multiline
          maxLength={1000}   // 目安で1000文字制限
        />
        <View style={{ height: 8 }} />
        <Pressable
          onPress={onSave}
          disabled={loading}
          style={[styles.btn, { backgroundColor: '#0ea5e9', alignSelf: 'flex-start', opacity: loading ? 0.6 : 1 }]}
        >
          <Text style={styles.btnText}>{loading ? '保存中…' : '保存する'}</Text>
        </Pressable>

        <Text style={{ marginTop: 10, color: '#64748b' }}>
          プレビュー：{note ? note : '（未入力）'}
        </Text>
      </View>
    </View>
  );
}

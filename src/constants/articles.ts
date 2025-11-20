// 内部（アプリ内）記事の定義とユーティリティ
// - unlockedArticles(days): いま読める記事（解禁済み）を配列で返す
// - nextInternalArticle(days): 次に解禁される記事を1本だけ返す（なければ null）

export type InternalArticle = {
  id: string;
  title: string;
  content: string;
  /** 何日目から読めるか（解禁日数） */
  min: number;
};

// ここは自由に増減OK（既存の内容に合わせて調整してください）
export const ARTICLES: InternalArticle[] = [
  {
    id: 'a-start-dash',
    min: 0,
    title: 'スタートダッシュのコツ',
    content:
      '最初の3日は「環境づくり」：SNSミュート / 寝室からスマホ退避 / 風呂→就寝ルーティン固定。',
  },
  {
    id: 'a-day3-wall',
    min: 3,
    title: '3日目の壁：切り替えの型',
    content:
      '散歩10分→腕立て10回→冷水洗顔×3セット。衝動は必ず7〜10分で弱まる。物理で切る。',
  },
  {
    id: 'a-week1',
    min: 7,
    title: '1週間：ご褒美の設計',
    content: '糖やギャンブルでなく「体験」にご褒美（サウナ/映画/カフェ）。次の1週間の燃料に。',
  },
  {
    id: 'a-week2',
    min: 14,
    title: '2週間：習慣化チェック',
    content: '就寝・起床・入浴の固定化。毎日の同時刻化で「考えずに行動する」状態を作る。',
  },
  {
    id: 'a-day21',
    min: 21,
    title: '21日：トリガー攻略',
    content: '引き金の棚卸し（時間/場所/感情/アプリ）。先回りで予定を埋めてトリガーを踏ませない。',
  },
  {
    id: 'a-day30',
    min: 30,
    title: '30日：維持のミニマム',
    content:
      '毎日1分のジャーナルで客観視。筋トレ・散歩・温冷シャワーなどの物理ルーチンを1つは死守。',
  },
];

// -------- ユーティリティ --------

// 現在日数で「解禁済み」の記事を返す（古い順）
export function unlockedArticles(days: number): InternalArticle[] {
  const d = Number.isFinite(days) ? Math.floor(days) : 0;
  return ARTICLES.filter((a) => d >= a.min).sort((a, b) => a.min - b.min);
}

// 現在日数で「次に解禁される1本」を返す（無ければ null）
export function nextInternalArticle(days: number): InternalArticle | null {
  const d = Number.isFinite(days) ? Math.floor(days) : 0;
  return (
    [...ARTICLES]
      .sort((a, b) => a.min - b.min)
      .find((a) => a.min > d) ?? null
  );
}

// src/constants/recommended.ts
// 経過日数に応じて「今読むと効く記事」を返す

export type RecItem = {
  id: string;          // ← ユニークID（key警告対策）
  title: string;       // 表示タイトル
  subtitle?: string;   // 補足
  link: string;        // 絶対URL（WordPressのパーマリンク）
  icon?: string;       // 絵文字
};

type Range = { maxDay: number; items: RecItem[] };

// .env があれば優先、なければデフォルト
const BASE = (process.env.EXPO_PUBLIC_BLOG_BASE ?? "https://onakin-blog.com").replace(/\/$/, "");

// 相対/日本語を安全に絶対URLへ
const abs = (path: string) => {
  // すでに http(s) ならそのまま
  if (/^https?:\/\//i.test(path)) return encodeURI(path);
  // 先頭スラッシュでも、無しでも OK にする
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return encodeURI(`${BASE}${normalized}`);
};

export const RECOMMENDED_BY_DAY: Range[] = [
  {
    maxDay: 2,
    items: [
      {
        id: "start-dash",
        icon: "🚀",
        title: "スタートダッシュのコツ",
        subtitle: "最初の3日は“環境”で勝つ",
        link: abs("/onakin-day1-motivation/"),
      },
      {
        id: "urge-surfing",
        icon: "🧊",
        title: "衝動を切る即効技10選",
        subtitle: "波は7〜10分で必ず引く",
        link: abs("/urge-surfing/"),
      },
    ],
  },
  {
    maxDay: 6,
    items: [
      {
        id: "night-detox",
        icon: "📱",
        title: "夜のスマホ断ちルール",
        subtitle: "21時以降は“紙/Kindleのみ”",
        link: abs("/night-detox/"),
      },
      {
        id: "sleep-bath",
        icon: "🛁",
        title: "睡眠を整える入浴レシピ",
        subtitle: "就寝90分前の湯船が効く",
        link: abs("/sleep-bath/"),
      },
    ],
  },
  {
    maxDay: 13,
    items: [
      {
        id: "habit-checklist",
        icon: "📈",
        title: "1週間突破！定着のチェック表",
        subtitle: "固定化できた？を点検",
        link: abs("/habit-checklist/"),
      },
    ],
  },
  {
    maxDay: 29,
    items: [
      {
        id: "day21-wall",
        icon: "🛡️",
        title: "21日目の壁の越え方",
        subtitle: "“やる気”でなく“予定”で動く",
        link: abs("/21days-wall/"),
      },
    ],
  },
  {
    maxDay: 59,
    items: [
      {
        id: "weekly-review",
        icon: "⚔️",
        title: "安定フェーズの週次レビュー",
        subtitle: "やめることを1つ決める",
        link: abs("/weekly-review/"),
      },
    ],
  },
  {
    maxDay: 89,
    items: [
      {
        id: "gear-up-60",
        icon: "🗺️",
        title: "60日からのギアアップ",
        subtitle: "筋トレ週3と情報発信",
        link: abs("/gear-up-60/"),
      },
    ],
  },
  {
    maxDay: Number.POSITIVE_INFINITY,
    items: [
      {
        id: "share-after-90",
        icon: "🏆",
        title: "90日以降：維持より共有へ",
        subtitle: "ノウハウの言語化と発信",
        link: abs("/share-after-90/"),
      },
    ],
  },
];

// その日のレンジに該当する「配列（一次元）」を返す
export function recommendedFor(days: number): RecItem[] {
  const d = Number.isFinite(days) && days >= 0 ? Math.floor(days) : 0;
  const hit = RECOMMENDED_BY_DAY.find((r) => d <= r.maxDay);
  return hit ? hit.items : [];
}

// 1本だけ欲しいとき用（必要なら使用）
export function recommendedOne(days: number): RecItem | null {
  const list = recommendedFor(days);
  return list.length ? list[0] : null;
}

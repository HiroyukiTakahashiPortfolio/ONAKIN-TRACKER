// ランダムに表示する「キラーページ（アフィリエイト）」一覧とユーティリティ
// 置き換え自由。URLはあなたのアフィリンクに差し替えてください。

export type AffiliateLink = {
  id: string;
  title: string;
  url: string;     // そのまま外部ブラウザで開く
  icon?: string;   // 絵文字など
};

// 好きに編集してください（例）
export const AFF_KILLER_PAGES: AffiliateLink[] = [
  {
    id: 'aff-protein',
    title: '【PR】高タンパク＆低脂質プロテイン',
    url: 'https://onakin-blog.com/aff/protein',
    icon: '💪',
  },
  {
    id: 'aff-mat',
    title: '【PR】自宅トレ用ヨガマット',
    url: 'https://onakin-blog.com/aff/yoga-mat',
    icon: '🧘',
  },
  {
    id: 'aff-kindle',
    title: '【PR】夜のスマホ断ちはKindleで',
    url: 'https://onakin-blog.com/aff/kindle',
    icon: '📚',
  },
  {
    id: 'aff-supp',
    title: '【PR】集中力サポートサプリ',
    url: 'https://onakin-blog.com/aff/focus-supp',
    icon: '🧠',
  },
  {
    id: 'aff-bottle',
    title: '【PR】1Lウォーターボトルで水分管理',
    url: 'https://onakin-blog.com/aff/water-bottle',
    icon: '🚰',
  },
];

// ---- ランダム選出（seed で毎日/日数ごとに安定化） ----

// シード付き簡易乱数（mulberry32）
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** seed に基づいて n 件ピック（順序も安定） */
export function pickAffiliates(seed: number, n = 3): AffiliateLink[] {
  const rng = mulberry32(seed || 1);
  const arr = [...AFF_KILLER_PAGES];
  // Fisher–Yates シャッフル（seeded）
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

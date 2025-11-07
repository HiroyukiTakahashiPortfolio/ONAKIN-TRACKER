export const PHASES = [
  { min: 1, title: '見習いパダワン' },
  { min: 3, title: '駆け出しジェダイ' },
  { min: 7, title: '第1関門突破' },
  { min: 14, title: 'フォースの芽生え' },
  { min: 21, title: '集中の達人' },
  { min: 30, title: 'ジェダイ・ナイト' },
  { min: 60, title: '心の守護者' },
  { min: 90, title: 'ハイパードライブ' },
  { min: 120, title: 'マスター候補' },
  { min: 180, title: 'ジェダイ・マスター' },
  { min: 365, title: '伝説の賢者' },
];

export const titleForDays = (days: number) => {
  let cur = PHASES[0].title;
  for (const p of PHASES) if (days >= p.min) cur = p.title;
  return cur;
};

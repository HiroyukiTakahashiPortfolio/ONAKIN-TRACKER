export type ExtArticle = { id: string; title: string; desc?: string; url: string; min: number };

const RECOMMENDED: ExtArticle[] = [
  {
    id: 'r-start',
    min: 1,
    title: 'スタートダッシュのコツ',
    desc: '最初の3日は環境づくり：SNSミュート/就寝前スマホオフ/風呂→就寝',
    url: 'https://onakin-blog.com/entry/start-dash?utm_source=app&utm_medium=recommend&utm_campaign=stage1',
  },
  {
    id: 'r-day3',
    min: 3,
    title: '3日目の壁を越える行動レシピ',
    desc: '散歩10分→腕立て10回→冷水洗顔×3セットで物理的に切る',
    url: 'https://onakin-blog.com/entry/day3-wall?utm_source=app&utm_medium=recommend&utm_campaign=stage1',
  },
  {
    id: 'r-week1',
    min: 7,
    title: '1週間：ご褒美の設計',
    desc: '糖やギャンブルより“体験”にご褒美（サウナ/映画/カフェ）',
    url: 'https://onakin-blog.com/entry/week1-reward?utm_source=app&utm_medium=recommend&utm_campaign=stage1',
  },
  {
    id: 'r-week2',
    min: 14,
    title: '2週間：習慣化チェック',
    url: 'https://onakin-blog.com/entry/14days-habit?utm_source=app&utm_medium=recommend&utm_campaign=stage2',
  },
  {
    id: 'r-day21',
    min: 21,
    title: '21日：トリガー攻略',
    url: 'https://onakin-blog.com/entry/trigger-map?utm_source=app&utm_medium=recommend&utm_campaign=stage2',
  },
];

export const recommendedFor = (days: number) =>
  RECOMMENDED.filter(a => days >= a.min).sort((a,b)=>a.min - b.min);

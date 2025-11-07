import type { Article } from '../state/types';

export const ARTICLES: Article[] = [
  { id: 'start', min: 1,  title: 'スタートダッシュのコツ', content: '最初の3日は「環境」を整える。SNSミュート / 寝室からスマホ退避 / 風呂→就寝ルーティン固定。' },
  { id: 'day3',  min: 3,  title: '三日目の壁：行動レシピ', content: '衝動が来たら：散歩10分→腕立て10回→冷水洗顔を3セット。物理で切る。' },
  { id: 'week1', min: 7,  title: '1週間：ご褒美の設計', content: '糖やギャンブル系より体験のご褒美（サウナ・映画・カフェ）が再発トリガーになりにくい。' },
  { id: 'week2', min: 14, title: '2週間：習慣化チェック', content: '朝の開始儀式・就寝儀式・散歩枠・筋トレ枠。毎日同じ時間に置く。' },
  { id: 'day21', min: 21, title: '21日：トリガー攻略', content: '紙にトリガーを書き出し、代替行動をペアで用意。例：ストレス→5深呼吸+外気。' },
  { id: 'day30', min: 30, title: '30日：次の目標',       content: '次は「やりたいこと」で目標を作る。例：体脂肪-2%・アプリMVP完成…' },
];

export const unlockedArticles = (days: number) =>
  ARTICLES.filter(a => days >= a.min).sort((a,b)=>a.min-b.min);

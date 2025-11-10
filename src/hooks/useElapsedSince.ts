import { useEffect, useState } from 'react';

/**
 * startAtISO からの経過を 1 秒ごとに返す。
 * startAtISO が変わった瞬間に 0 から再計算される。
 */
export default function useElapsedSince(startAtISO?: string | null) {
  const [now, setNow] = useState<number>(Date.now());

  // 開始基準が変わったら即リフレッシュ
  useEffect(() => { setNow(Date.now()); }, [startAtISO]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!startAtISO) {
    return {
      days: 0, hours: 0, minutes: 0, seconds: 0,
      hms: '00:00:00', label: '0日 0時間 0分 0秒'
    };
  }

  const start = new Date(startAtISO).getTime();
  const diffSec = Math.max(0, Math.floor((now - start) / 1000));
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const totalHours = hours + days * 24;

  return {
    days, hours, minutes, seconds,
    hms: `${pad2(totalHours)}:${pad2(minutes)}:${pad2(seconds)}`,
    label: `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`,
  };
}

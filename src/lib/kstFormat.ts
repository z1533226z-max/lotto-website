/** KST 고정 날짜·시각 표기 (서버 UTC·브라우저 어느 쪽에서 렌더해도 같은 문자열) */
const KST_DRAW_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

/** 예) "10월 24일 (토) 오후 8:35" */
export function formatKstDrawTime(ms: number): string {
  return KST_DRAW_FORMAT.format(new Date(ms));
}

/** 남은 시간 "1일 3시간 20분" / "12분 5초" */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return '추첨 중';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}일 ${h}시간 ${m}분`;
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분 ${s}초`;
}

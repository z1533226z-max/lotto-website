/**
 * 로또 6/45 추첨 일정 (KST 기준) — 서버·클라이언트 공용 순수 함수
 *
 * 1회: 2002-12-07(토) 20:35 KST, 이후 매주 토요일 20:35 KST (휴방 없이 1주 1회차).
 * 실행 환경의 타임존(Vercel=UTC, 로컬=KST)과 무관하게 같은 결과를 내도록 UTC 밀리초로만 계산한다.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** 1회 추첨 시각: 2002-12-07 20:35 KST = 11:35 UTC */
const FIRST_DRAW_UTC_MS = Date.UTC(2002, 11, 7, 11, 35);

/**
 * `now` 시점까지 추첨이 끝난 최신 회차 (토요일 20:35 KST 기준).
 * 예) 2026-10-03(토) 20:34 KST → 1243, 20:35 KST → 1244
 */
export function getLatestDrawnRound(now: Date = new Date()): number {
  const elapsed = now.getTime() - FIRST_DRAW_UTC_MS;
  if (elapsed < 0) return 0;
  return Math.floor(elapsed / WEEK_MS) + 1;
}

/**
 * 새 회차 반영 때 다시 만들 페이지 목록 (/api/cron/revalidate · /api/cron/draw-refresh 공용)
 */
export const DRAW_REVALIDATE_PATHS = [
  '/',
  '/lotto/recent',
  '/lotto/list',
  '/lotto/rankings',
  '/lotto/statistics',
  '/lotto/ai-hits',
  '/lotto/calculator',
  '/lotto/stores',
  '/lotto/my-numbers',
  '/community',
  '/lotto/daily-fortune',
  '/rss.xml',
];

/** 회차 개별 페이지: 최신·직전(당첨금 갱신), 그리고 아직 데이터가 없던 예상 회차(먼저 열려 404 로 캐시됐을 수 있음) */
export function getRoundPathsToRevalidate(latestRound: number, expectedRound: number): string[] {
  const rounds = new Set<number>();
  if (latestRound > 0) {
    rounds.add(latestRound);
    if (latestRound > 1) rounds.add(latestRound - 1);
  }
  if (expectedRound > 0) rounds.add(expectedRound);
  return Array.from(rounds).sort((a, b) => b - a).map(r => `/lotto/${r}`);
}

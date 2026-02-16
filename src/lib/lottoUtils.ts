/**
 * 로또 관련 유틸리티 함수
 */

/**
 * 다음 추첨 회차 번호를 계산합니다.
 * 로또 추첨: 매주 토요일 20:45 KST
 * 1회차 기준일: 2002-12-07
 */
export function getNextDrawRound(): number {
  const now = new Date();

  // KST로 변환
  const kstOffset = 9 * 60; // UTC+9
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstDate = new Date(utcMs + (kstOffset * 60000));

  // 1회차 기준일 (2002-12-07 토요일)
  const firstDraw = new Date(Date.UTC(2002, 11, 7)); // month is 0-indexed
  const firstDrawKst = new Date(firstDraw.getTime() + (kstOffset * 60000));

  const diffMs = kstDate.getTime() - firstDrawKst.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  // 현재 주의 회차 (0-indexed 주 → 1-indexed 회차)
  const currentWeekRound = diffWeeks + 1;

  const dayOfWeek = kstDate.getDay(); // 0=일, 6=토
  const hour = kstDate.getHours();
  const minute = kstDate.getMinutes();

  // 토요일 20:45 이전이면 아직 추첨 전 → 현재 주의 회차
  if (dayOfWeek === 6 && (hour < 20 || (hour === 20 && minute < 45))) {
    return currentWeekRound;
  }

  // 그 외(토 20:45 이후, 일~금) → 추첨 완료, 다음 회차
  return currentWeekRound + 1;
}

/**
 * 로또 번호 세트를 검증합니다.
 * @param numbers 번호 배열 (6개)
 * @returns 유효하면 true
 */
export function validateLottoNumbers(numbers: number[]): boolean {
  if (!Array.isArray(numbers) || numbers.length !== 6) return false;

  const seen = new Set<number>();
  for (const n of numbers) {
    if (typeof n !== 'number' || !Number.isInteger(n)) return false;
    if (n < 1 || n > 45) return false;
    if (seen.has(n)) return false; // 중복
    seen.add(n);
  }

  return true;
}

/**
 * 당첨 결과에 따른 등수를 계산합니다.
 * @param matchedCount 일치 개수 (0~6)
 * @param bonusMatched 보너스 번호 일치 여부
 * @returns 등수 (0 = 미당첨, 1~5)
 */
export function calculateRank(matchedCount: number, bonusMatched: boolean): number {
  if (matchedCount === 6) return 1;
  if (matchedCount === 5 && bonusMatched) return 2;
  if (matchedCount === 5) return 3;
  if (matchedCount === 4) return 4;
  if (matchedCount === 3) return 5;
  return 0; // 미당첨
}

/**
 * 등수에 따른 한글 라벨을 반환합니다.
 */
export function getRankLabel(rank: number): string {
  switch (rank) {
    case 1: return '1등';
    case 2: return '2등';
    case 3: return '3등';
    case 4: return '4등';
    case 5: return '5등';
    default: return '미당첨';
  }
}

/**
 * 등수에 따른 색상을 반환합니다.
 */
export function getRankColor(rank: number): string {
  switch (rank) {
    case 1: return '#FF6B35'; // orange
    case 2: return '#FFD700'; // gold
    case 3: return '#C0C0C0'; // silver
    case 4: return '#CD7F32'; // bronze
    case 5: return '#808080'; // gray
    default: return 'var(--text-tertiary)';
  }
}

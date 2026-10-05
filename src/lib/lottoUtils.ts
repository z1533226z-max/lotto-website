/**
 * 로또 관련 유틸리티 함수
 */
import { getLatestDrawnRound } from './drawSchedule';

/**
 * 다음 추첨 회차 번호 (KST 토요일 20:35 추첨 기준, 실행 환경 타임존과 무관).
 * 예) 토 20:34 KST → 그날 추첨할 회차, 20:35 이후 → 다음 주 회차
 *
 * 이전 구현은 브라우저(KST)에서 토요일 18:00 이전, 서버(UTC)에서 토요일 09:00 이전에
 * 이미 추첨이 끝난 지난 회차를 '다음 회차'로 돌려줬다.
 */
export function getNextDrawRound(now: Date = new Date()): number {
  return getLatestDrawnRound(now) + 1;
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
    case 1: return '#D36135'; // orange
    case 2: return '#FFD700'; // gold
    case 3: return '#C0C0C0'; // silver
    case 4: return '#CD7F32'; // bronze
    case 5: return '#808080'; // gray
    default: return 'var(--text-tertiary)';
  }
}

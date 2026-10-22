/**
 * "이번 주 내 행운 번호" 공유 주소 코드: `{회차}-{번호6개}` (예: 1248-3-12-24-33-39-42)
 * 공유 페이지(/lotto/share/[code])는 noindex 이며 사이트맵에 넣지 않는다 (얇은 자동 페이지 방지).
 */
import { validateLottoNumbers } from './lottoUtils';

export const SITE_URL = 'https://lotto.gon.ai.kr';

export interface ShareTicket {
  round: number;
  numbers: number[];
}

export function encodeShareCode(round: number, numbers: number[]): string {
  return [round, ...[...numbers].sort((a, b) => a - b)].join('-');
}

export function parseShareCode(code: string): ShareTicket | null {
  if (!/^[1-9]\d{0,4}(-[1-9]\d?){6}$/.test(code)) return null;
  const [round, ...numbers] = code.split('-').map(Number);
  if (!validateLottoNumbers(numbers)) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  // 정렬된 주소 하나만 유효 (같은 번호가 여러 주소로 갈리지 않게)
  if (sorted.join('-') !== numbers.join('-')) return null;
  return { round, numbers: sorted };
}

export function getShareUrl(round: number, numbers: number[]): string {
  return `${SITE_URL}/lotto/share/${encodeShareCode(round, numbers)}`;
}

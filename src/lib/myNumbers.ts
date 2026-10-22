/**
 * 내 번호 저장(가입 없이 브라우저 localStorage) + 당첨 확인 — 서버로 보내지 않는다.
 *
 * 저장 키·형식은 NumberGenerator 비회원 저장과 같다:
 *   savedLottoNumbers = [{ id, numbers, createdAt, isAI, round? }]
 * round 가 없으면(예전 저장분) 저장 시각 기준 다음 추첨 회차를 대상 회차로 본다.
 */
import { calculateRank, getNextDrawRound, validateLottoNumbers } from './lottoUtils';

export const MY_NUMBERS_STORAGE_KEY = 'savedLottoNumbers';
export const MY_NUMBERS_MAX = 50;

export interface MyNumberEntry {
  id: string;
  numbers: number[];
  createdAt: string;
  isAI: boolean;
  round?: number;
}

export interface DrawLike {
  round: number;
  numbers: number[];
  bonusNumber: number;
}

export interface TicketResult {
  matched: number;
  bonusMatched: boolean;
  rank: number; // 0 = 미당첨
  matchedNumbers: number[];
}

/** 저장소 문자열 → 유효한 항목만 (깨진 값·잘못된 번호는 버림) */
export function parseMyNumbers(raw: string | null): MyNumberEntry[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const result: MyNumberEntry[] = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const e = item as Record<string, unknown>;
    const numbers = Array.isArray(e.numbers) ? e.numbers.map(Number) : [];
    if (!validateLottoNumbers(numbers)) continue;
    const createdAt = typeof e.createdAt === 'string' && !Number.isNaN(Date.parse(e.createdAt))
      ? e.createdAt
      : new Date(0).toISOString();
    const round = Number.isInteger(e.round) && (e.round as number) > 0 ? (e.round as number) : undefined;
    result.push({
      id: typeof e.id === 'string' && e.id ? e.id : `${createdAt}-${numbers.join('-')}`,
      numbers: [...numbers].sort((a, b) => a - b),
      createdAt,
      isAI: e.isAI === true,
      ...(round ? { round } : {}),
    });
  }
  return result;
}

/** 이 번호가 겨냥한 추첨 회차 */
export function getTargetRound(entry: MyNumberEntry): number {
  return entry.round ?? getNextDrawRound(new Date(entry.createdAt));
}

/** 새 항목 추가 (같은 회차·같은 번호 중복은 건너뜀, 최대 MY_NUMBERS_MAX개 — 오래된 것부터 밀어냄) */
export function addMyNumbers(
  list: MyNumberEntry[],
  sets: number[][],
  options: { isAI: boolean; round: number; now?: Date },
): MyNumberEntry[] {
  const now = options.now ?? new Date();
  const next = [...list];
  sets.forEach((numbers, i) => {
    if (!validateLottoNumbers(numbers)) return;
    const sortedNums = [...numbers].sort((a, b) => a - b);
    const key = sortedNums.join('-');
    if (next.some(e => getTargetRound(e) === options.round && e.numbers.join('-') === key)) return;
    next.push({
      id: `${now.getTime().toString(36)}-${i}-${key}`,
      numbers: sortedNums,
      createdAt: now.toISOString(),
      isAI: options.isAI,
      round: options.round,
    });
  });
  return next.slice(-MY_NUMBERS_MAX);
}

export function checkTicket(numbers: number[], draw: DrawLike): TicketResult {
  const winning = new Set(draw.numbers);
  const matchedNumbers = numbers.filter(n => winning.has(n));
  const matched = matchedNumbers.length;
  // 2등 판정용 보너스는 5개 일치일 때만 의미가 있다
  const bonusMatched = numbers.includes(draw.bonusNumber);
  return { matched, bonusMatched, rank: calculateRank(matched, bonusMatched), matchedNumbers };
}

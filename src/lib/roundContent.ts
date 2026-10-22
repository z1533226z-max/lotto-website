/**
 * 회차 페이지(/lotto/[round]) 본문 글 — 화면(LottoRoundDetail·RoundWinningStores)과 RSS(lib/rss) 공용.
 * 네이버 RSS 는 item 에 본문 전체를 요구하므로 화면과 같은 함수로 같은 글을 만든다.
 * (다음 추첨 카운트다운·내 번호 확인은 보는 사람마다 다른 화면 기능이라 본문에 넣지 않는다)
 */
import type { LottoResult } from '@/types/lotto';
import type { PurchaseType } from '@/types/database';
import { calculateNetPrize } from './prizeTax';
import { getPrizeState, type PrizeState } from './prizeStatus';
import { formatCurrency, formatDrawDateKo, formatNumber } from './utils';

/** 글 조각: 문자열은 보통 글자, { strong } 은 굵은 글자 */
export type TextPart = string | { strong: string };

export const NUMBER_BAND_LABELS = ['1~9', '10~19', '20~29', '30~39', '40~45'];

export const PRIZE_TAX_NOTE =
  '세후 금액은 소득세법 기준 원천징수(200만원 이하 비과세, 3억 이하 22%, 3억 초과분 33%) 추정치입니다.';

export const STORES_SOURCE_NOTE =
  '자료: 동행복권 공개 1등 배출점 정보(제3자 공개 페이지에서 수집). 판매점 위치는 당첨 확률과 관계가 없습니다.';

export const PROBABILITY_NOTE =
  '모든 번호 조합의 당첨 확률은 같습니다(1등 8,145,060분의 1). 정확한 결과는 동행복권 공식 발표로 확인하세요.';

export const roundTitle = (d: LottoResult) => `로또 ${d.round}회 당첨번호`;
export const roundDateLabel = (d: LottoResult) => `(${formatDrawDateKo(d.drawDate)} 추첨)`;

export interface RoundAnalysis {
  oddCount: number;
  evenCount: number;
  lowCount: number;
  highCount: number;
  sum: number;
  consecutivePairs: number;
  bands: number[];
}

export function analyzeRoundNumbers(numbers: number[]): RoundAnalysis {
  const nums = [...numbers].sort((a, b) => a - b);
  const oddCount = nums.filter(n => n % 2 === 1).length;
  const lowCount = nums.filter(n => n <= 22).length; // 저번호 1~22
  const sum = nums.reduce((a, b) => a + b, 0);

  // 연속번호 쌍 개수 (예: 14,15 → 1쌍)
  let consecutivePairs = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] === 1) consecutivePairs++;
  }

  // 구간별 분포 (1-9, 10-19, 20-29, 30-39, 40-45)
  const bands = [0, 0, 0, 0, 0];
  nums.forEach(n => {
    bands[n <= 9 ? 0 : n <= 19 ? 1 : n <= 29 ? 2 : n <= 39 ? 3 : 4]++;
  });

  return {
    oddCount, evenCount: nums.length - oddCount,
    lowCount, highCount: nums.length - lowCount,
    sum, consecutivePairs, bands,
  };
}

export const patternHeading = (d: LottoResult) => `로또 ${d.round}회 당첨번호 패턴 분석`;

/** 패턴 분석 문단 */
export function patternParts(d: LottoResult, a: RoundAnalysis): TextPart[] {
  const sortedNumbers = [...d.numbers].sort((x, y) => x - y).join(', ');
  return [
    `${d.round}회 로또 당첨번호는 `, { strong: sortedNumbers }, ' 이며 보너스 번호는 ', { strong: String(d.bonusNumber) },
    `입니다. 이번 회차는 홀수 ${a.oddCount}개·짝수 ${a.evenCount}개로 구성되었고, 저번호(1~22) ${a.lowCount}개·고번호(23~45) ${a.highCount}개가 나왔습니다. 당첨번호 6개의 합계는 `,
    { strong: String(a.sum) },
    `이며, ${a.consecutivePairs > 0 ? `연속번호가 ${a.consecutivePairs}쌍 포함되어 있습니다.` : '연속번호는 포함되지 않았습니다.'}`,
  ];
}

/** 패턴 요약 칸 (라벨, 값) */
export const patternStats = (a: RoundAnalysis): Array<[string, string]> => [
  ['홀 : 짝', `${a.oddCount} : ${a.evenCount}`],
  ['저 : 고', `${a.lowCount} : ${a.highCount}`],
  ['번호 합계', String(a.sum)],
  ['연속번호', `${a.consecutivePairs}쌍`],
];

export const bandLabel = (a: RoundAnalysis, i: number) => `${NUMBER_BAND_LABELS[i]}: ${a.bands[i]}개`;

export interface PrizeText {
  heading: string;
  state: PrizeState;
  /** 지급일 때만 */
  amount?: string;
  detail?: string;
  net?: string;
  netDetail?: string;
  /** 이월·집계 중 안내 */
  status?: string;
}

/** 등수별 당첨금 글: 1인 당첨금·당첨자 수·세후 실수령액, 또는 이월·집계 중 */
export function prizeText(d: LottoResult, rank: 1 | 2): PrizeText {
  const prize = rank === 1 ? d.prizeMoney.first : d.prizeMoney.second;
  const winners = rank === 1 ? d.prizeMoney.firstWinners : d.prizeMoney.secondWinners;
  const state = getPrizeState(d, rank);
  const heading = `${rank}등 1인 당첨금`;
  if (state !== 'paid') {
    return { heading, state, status: state === 'rollover' ? '1등 당첨자 없음 (당첨금 이월)' : '당첨금 집계 중' };
  }
  const net = calculateNetPrize(prize);
  return {
    heading,
    state,
    amount: formatCurrency(prize),
    detail: `${formatNumber(prize)}원 · ${formatNumber(winners)}명 당첨`,
    net: formatCurrency(net.net),
    netDetail: `${formatNumber(net.net)}원 (세금 ${formatNumber(net.totalTax)}원, ${prize > 300_000_000 ? '3억 이하 22%·초과분 33%' : '22%'})`,
  };
}

export interface StoreLike {
  name: string;
  address: string;
  purchaseType: PurchaseType;
}

export const storesHeading = (round: number) => `로또 ${round}회 1등 당첨 판매점`;
export const STORE_TABLE_HEADERS = ['#', '상호', '구분', '소재지'];

export function countByPurchaseType(stores: StoreLike[]): Record<PurchaseType, number> {
  const counts: Record<PurchaseType, number> = { 자동: 0, 수동: 0, 반자동: 0 };
  for (const s of stores) counts[s.purchaseType] = (counts[s.purchaseType] ?? 0) + 1;
  return counts;
}

/** 판매점 요약 문단 (판매점이 1곳 이상일 때) */
export function storesSummaryParts(round: number, firstWinners: number, stores: StoreLike[]): TextPart[] {
  const c = countByPurchaseType(stores);
  return [
    `${round}회 1등 배출점은 `, { strong: `${stores.length}곳` },
    `입니다 (자동 ${c.자동} · 수동 ${c.수동} · 반자동 ${c.반자동}).`,
    ...(firstWinners > stores.length ? [' 온라인(인터넷) 구매 당첨은 판매점 목록에 나오지 않을 수 있습니다.'] : []),
  ];
}

/** 판매점 조회 실패·수집 전 안내 (링크 글자 앞·뒤) */
export const storesFallback = (round: number) => ({
  before: `${round}회 1등 판매점 정보는 동행복권 발표 후 순차 반영됩니다. 지역별 명당은 `,
  link: '판매점 페이지',
  after: '에서 볼 수 있습니다.',
});

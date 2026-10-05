import type { LottoResult } from '@/types/lotto';

/**
 * CrossSectionLinks(다른 분석 더보기)에 넣을 '최신' 링크 재료.
 *
 * 서버에서 실제 당첨 데이터로 계산해 넘긴다 → 링크 대상이 항상 존재(404 링크 없음).
 * - 회차·주간분석: 데이터에 있는 최신 회차 (/lotto/{회차}, /lotto/analysis/weekly/{회차})
 * - 월별·연도별: 최신 추첨일이 속한 달·해 (그 달에 추첨이 1회 이상 있으므로 항상 존재)
 * - 생일: 생성 시점의 KST 오늘(MM-DD) — 생일 페이지는 366일 모두 존재
 */
export interface FreshLinkData {
  latestRound: number;
  /** 최신 회차 추첨일 YYYY-MM-DD */
  latestDrawDate: string;
  /** KST 기준 오늘 MM-DD */
  todayMonthDay: string;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 기준 오늘의 MM-DD (실행 환경 타임존과 무관) */
export function kstMonthDay(now: Date = new Date()): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(5, 10);
}

/** 주간분석 상세는 11회차부터 존재 (weeklyAnalysisGenerator: 직전 10회 필요) */
const MIN_WEEKLY_ROUND = 11;

export function getFreshLinkData(allData: LottoResult[], now: Date = new Date()): FreshLinkData | null {
  const latest = allData.length > 0 ? allData[allData.length - 1] : null;
  if (!latest || latest.round < MIN_WEEKLY_ROUND || !/^\d{4}-\d{2}-\d{2}$/.test(latest.drawDate)) {
    return null;
  }
  return {
    latestRound: latest.round,
    latestDrawDate: latest.drawDate,
    todayMonthDay: kstMonthDay(now),
  };
}

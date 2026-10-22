/**
 * 회차 당첨금 집계 상태 (화면·RSS·데이터 갱신 판정 공용)
 *
 * 추첨(토 20:35) 직후에는 번호만 먼저 공개되고 등위별 당첨금·인원은 나중에 집계된다.
 * smok95 는 이때 divisions 를 비워 보내고, gon-services 는 금액을 null 로 보내 0 으로 바뀐다.
 * 이 0 을 그대로 쓰면 "1등 당첨자 없음(이월)"로 잘못 보이므로 '집계 중'과 '확정 0명'을 나눈다.
 *
 * 판정: 2등 당첨금·인원이 있으면 집계 완료. 2등 당첨자가 0명이었던 회차는 2002년 3·5회뿐이라
 * (내장 자료 1~1215회 확인) 그 이전 회차는 미집계로 보지 않는다.
 */
import type { LottoResult } from '@/types/lotto';

const LAST_ROUND_WITHOUT_SECOND_PRIZE = 5;

export function isPrizePending(d: Pick<LottoResult, 'round' | 'prizeMoney'>): boolean {
  if (d.round <= LAST_ROUND_WITHOUT_SECOND_PRIZE) return false;
  return !(d.prizeMoney.second > 0 && d.prizeMoney.secondWinners > 0);
}

export type PrizeState = 'paid' | 'rollover' | 'pending';

/** 등수별 표시 상태: 지급(금액 있음) · 이월(집계 끝난 1등 0명) · 집계 중 */
export function getPrizeState(d: Pick<LottoResult, 'round' | 'prizeMoney'>, rank: 1 | 2): PrizeState {
  const prize = rank === 1 ? d.prizeMoney.first : d.prizeMoney.second;
  const winners = rank === 1 ? d.prizeMoney.firstWinners : d.prizeMoney.secondWinners;
  if (prize > 0) return 'paid';
  if (rank === 1 && winners === 0 && !isPrizePending(d)) return 'rollover';
  return 'pending';
}

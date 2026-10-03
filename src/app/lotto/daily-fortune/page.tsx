import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTodayKST } from '@/lib/dailyFortuneGenerator';

// 오늘 날짜의 행운번호 페이지로 리다이렉트
// 1시간마다 재생성 — 빌드 시점 날짜로 굳지 않도록 (자정 cron revalidate가 실패해도 1시간 내 갱신)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: '오늘의 띠별 로또 행운번호 - 사주 기반 AI 분석 | 로또킹',
  description: '12띠별 오늘의 로또 행운번호를 사주 오행 분석으로 매일 자동 생성합니다. 내 띠의 행운번호, 총운, 재물운을 확인하세요!',
};

export default function DailyFortunePage() {
  const today = getTodayKST();
  redirect(`/lotto/daily-fortune/${today}`);
}

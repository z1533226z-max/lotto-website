import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTodayKST } from '@/lib/dailyFortuneGenerator';

// 오늘 날짜의 행운번호 페이지로 리다이렉트
// 요청마다 실행 — 정적 프리렌더(revalidate)로 두면 Next 14.2는 PPR이 꺼진 상태에서
// redirect()의 Location 헤더를 .meta에 저장하지 않아 'Location 없는 307 + 에러 셸'이 응답된다.
// (node_modules/next/dist/export/routes/app-page.js: res.getHeaders()는 experimental.ppr일 때만 복사)
// force-dynamic이면 매 요청 307 + Location: /lotto/daily-fortune/<오늘 KST>가 나가 JS 없는 크롤러도 따라간다.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '오늘의 띠별 로또 행운번호 - 사주 기반 AI 분석 | 로또킹',
  description: '12띠별 오늘의 로또 행운번호를 사주 오행 분석으로 매일 자동 생성합니다. 내 띠의 행운번호, 총운, 재물운을 확인하세요!',
};

export default function DailyFortunePage() {
  const today = getTodayKST();
  redirect(`/lotto/daily-fortune/${today}`);
}

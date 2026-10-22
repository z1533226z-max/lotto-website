import { Metadata } from 'next';
import { getTodayKST } from '@/lib/dailyFortuneGenerator';
import { DEFAULT_OG_IMAGES } from '@/lib/seo';
import DailyFortuneView from './DailyFortuneView';

// 띠별 행운번호 대표 URL: 오늘(KST) 내용을 리다이렉트 없이 그대로 보여 준다.
// 날짜별 URL(/lotto/daily-fortune/YYYY-MM-DD)은 매일 새로 생겨 구글 대상에서 빼고, 구글에는 이 주소 하나만 낸다.
// 자정 갱신은 /api/cron/daily-fortune 이 revalidatePath('/lotto/daily-fortune')로 처리한다.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: '오늘의 띠별 로또 행운번호 - 사주 기반 AI 분석 | 로또킹',
  description: '12띠별 오늘의 로또 행운번호를 사주 오행 분석으로 매일 자동 생성합니다. 내 띠의 행운번호, 총운, 재물운을 확인하세요!',
  alternates: { canonical: '/lotto/daily-fortune' },
  openGraph: {
    title: '오늘의 띠별 로또 행운번호',
    description: '사주 오행 분석 기반 12띠별 행운번호. 내 띠의 오늘 행운번호를 확인하세요!',
    url: 'https://lotto.gon.ai.kr/lotto/daily-fortune',
    images: DEFAULT_OG_IMAGES,
  },
};

export default function DailyFortunePage() {
  const today = getTodayKST();
  return <DailyFortuneView date={today} today={today} />;
}

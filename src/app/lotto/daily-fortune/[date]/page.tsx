import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatDateKorean, isDateInFortuneWindow, getTodayKST } from '@/lib/dailyFortuneGenerator';
import { NAVER_ONLY_ROBOTS, DEFAULT_OG_IMAGES } from '@/lib/seo';
import DailyFortuneView from '../DailyFortuneView';

// ISR: 1시간 캐시 (오늘 페이지), 과거 페이지는 영구 캐시
export const revalidate = 3600;

// 메타데이터 동적 생성
type PageProps = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  const today = getTodayKST();
  if (!isDateInFortuneWindow(date, today)) return { title: '띠별 로또 행운번호 | 로또킹' };

  const formatted = formatDateKorean(date);
  // 날짜별 URL은 매일 새로 생기므로 전부 구글/빙 색인 제외(네이버는 유지).
  // 구글 대표 URL은 오늘 내용을 그대로 보여 주는 허브 /lotto/daily-fortune
  return {
    ...NAVER_ONLY_ROBOTS,
    title: `${formatted} 띠별 로또 행운번호 - 사주 오행 분석 | 로또킹`,
    description: `${formatted} 12띠별 로또 행운번호입니다. 사주 오행 분석 기반으로 매일 자동 생성되는 행운번호와 총운, 재물운을 확인하세요.`,
    keywords: [`${date} 로또`, '띠별 행운번호', '사주 로또', '오늘의 로또번호', '띠별 운세', '로또 행운번호'],
    alternates: { canonical: `/lotto/daily-fortune/${date}` },
    openGraph: {
      title: `${formatted} 띠별 로또 행운번호`,
      description: `사주 오행 분석 기반 12띠별 행운번호. 내 띠의 오늘 행운번호를 확인하세요!`,
      url: `https://lotto.gon.ai.kr/lotto/daily-fortune/${date}`,
      images: DEFAULT_OG_IMAGES,
    },
  };
}

export default async function DailyFortuneDatePage({ params }: PageProps) {
  const { date } = await params;

  // 유효 기간: DAILY_FORTUNE_FIRST_DATE(사이트맵 최초 등재일) ~ 내일(KST). 그 밖은 notFound
  const today = getTodayKST();
  if (!isDateInFortuneWindow(date, today)) {
    notFound();
  }

  return <DailyFortuneView date={date} today={today} />;
}

import type { Metadata } from 'next';
import { DREAM_KEYWORDS } from '@/data/dreamNumbers';
import DreamLinkHub from './DreamLinkHub';
import { DEFAULT_OG_IMAGES } from '@/lib/seo';

export const metadata: Metadata = {
  title: '꿈번호 생성기 - 꿈해몽 로또번호 무료 추천 | 로또킹',
  description: `어젯밤 꿈을 로또번호로 바꿔보세요! ${DREAM_KEYWORDS.length}가지 꿈 키워드별 행운 번호 무료 제공. 꿈해몽 기반 로또번호 추천으로 이번주 당첨에 도전!`,
  openGraph: {
    title: '꿈번호 생성기 - 꿈해몽 로또번호 | 로또킹',
    description: `어젯밤 꿈을 로또번호로! ${DREAM_KEYWORDS.length}가지 꿈 키워드별 행운 번호 무료 제공.`,
    images: DEFAULT_OG_IMAGES,
  },
  alternates: {
    canonical: 'https://lotto.gon.ai.kr/lotto/dream',
  },
};

export default function DreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DreamLinkHub />
      {children}
    </>
  );
}

import type { Metadata } from 'next';
import DreamLinkHub from './DreamLinkHub';

export const metadata: Metadata = {
  title: '꿈번호 생성기 - 꿈해몽 로또번호 무료 추천 | 로또킹',
  description: '어젯밤 꿈을 로또번호로 바꿔보세요! 500가지+ 꿈 키워드별 행운 번호 무료 제공. 꿈해몽 기반 로또번호 추천으로 이번주 당첨에 도전!',
  openGraph: {
    title: '꿈번호 생성기 - 꿈해몽 로또번호 | 로또킹',
    description: '어젯밤 꿈을 로또번호로! 500가지+ 꿈 키워드별 행운 번호 무료 제공.',
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

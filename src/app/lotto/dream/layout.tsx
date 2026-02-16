import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '꿈번호 생성기 - 로또킹',
  description: '꿈에서 본 것을 로또 번호로! 전통 꿈해몽 기반 로또번호 생성기. 키워드를 입력하면 행운의 번호를 알려드립니다.',
  openGraph: {
    title: '꿈번호 생성기 - 로또킹',
    description: '꿈에서 본 것을 로또 번호로! 전통 꿈해몽 기반 로또번호 생성기.',
  },
};

export default function DreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

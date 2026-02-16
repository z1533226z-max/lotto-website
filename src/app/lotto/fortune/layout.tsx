import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '행운번호 생성기 - 로또킹',
  description: '생년월일과 이름으로 나만의 행운번호를 생성하세요. 오늘의 운세 번호, 궁합 번호도 확인!',
  openGraph: {
    title: '행운번호 생성기 - 로또킹',
    description: '생년월일과 이름으로 나만의 행운번호를 생성하세요. 오늘의 운세 번호, 궁합 번호도 확인!',
  },
};

export default function FortuneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

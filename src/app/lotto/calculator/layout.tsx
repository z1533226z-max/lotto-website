import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로또 당첨금 세금 계산기 - 로또킹',
  description: '로또 당첨금의 세후 실수령액을 간편하게 계산하세요. 3억 이하 22%, 3억 초과 33% 세율 적용. 구간별 세금 상세 내역 제공.',
  openGraph: {
    title: '로또 당첨금 세금 계산기 - 로또킹',
    description: '로또 당첨금의 세후 실수령액을 간편하게 계산하세요.',
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

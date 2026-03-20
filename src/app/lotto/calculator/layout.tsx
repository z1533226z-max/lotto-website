import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로또 당첨금 세금 계산기 - 실수령액 자동 계산 | 로또킹',
  description: '로또 당첨금 세금 자동 계산! 3억 이하 22%, 3억 초과 33% 구간별 세율 적용. 1등 20억 실수령액은? 소득세, 지방소득세 상세 내역까지 즉시 확인.',
  openGraph: {
    title: '로또 당첨금 세금 계산기 - 실수령액 자동 계산 | 로또킹',
    description: '로또 당첨금 세금을 자동 계산! 구간별 세율 적용, 실수령액 즉시 확인.',
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

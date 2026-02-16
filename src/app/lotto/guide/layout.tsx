import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로또 완전 가이드 - 로또킹 | 구매방법, 당첨금, 세금 안내',
  description: '로또 6/45 완벽 가이드. 구매 방법, 당첨 확률, 세금 계산, 당첨금 수령 방법까지 한눈에 알아보세요.',
  keywords: ['로또 가이드', '로또 구매방법', '로또 당첨확률', '로또 세금', '로또 수령방법', '로또 6/45'],
  openGraph: {
    title: '로또 완전 가이드 - 로또킹 | 구매방법, 당첨금, 세금 안내',
    description: '로또 6/45 완벽 가이드. 구매 방법, 당첨 확률, 세금 계산, 당첨금 수령 방법까지 한눈에 알아보세요.',
  },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

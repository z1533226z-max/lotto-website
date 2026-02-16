import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '당첨 판매점 - 로또킹 | 1등 2등 당첨 판매점 조회',
  description: '로또 1등, 2등 당첨 판매점 정보를 확인하세요. 지역별 당첨 현황, 자동/수동 구매방식 통계를 제공합니다.',
  keywords: ['로또 판매점', '당첨 판매점', '1등 판매점', '로또 당첨 매장', '로또 판매점 조회'],
  openGraph: {
    title: '당첨 판매점 - 로또킹',
    description: '로또 1등, 2등 당첨 판매점 정보와 지역별 통계',
  },
};

export default function StoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

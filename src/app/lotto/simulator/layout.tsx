import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로또 당첨 시뮬레이터 - 로또킹',
  description: '내가 매주 같은 번호를 샀다면? 로또 당첨 시뮬레이터로 과거 전 회차 당첨 결과를 확인해보세요.',
  openGraph: {
    title: '로또 당첨 시뮬레이터 - 로또킹',
    description: '내가 매주 같은 번호를 샀다면? 로또 당첨 시뮬레이터로 과거 전 회차 당첨 결과를 확인해보세요.',
  },
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 추천번호 적중 기록 - 로또킹',
  description: '로또킹 AI가 추천한 번호의 실제 적중 현황을 투명하게 공개합니다. 회차별 적중 개수, 평균 적중률, 최고 적중 기록을 확인하세요.',
  openGraph: {
    title: 'AI 추천번호 적중 기록 - 로또킹',
    description: 'AI가 추천한 로또번호의 실제 적중 현황을 투명하게 공개합니다.',
  },
};

export default function AIHitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

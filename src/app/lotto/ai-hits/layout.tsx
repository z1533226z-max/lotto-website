import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 로또 적중 기록 - 예측 번호 실제 결과 공개 | 로또킹',
  description: 'AI 로또 번호 예측의 실제 적중 결과를 매주 공개! 회차별 적중 개수, 3개 이상 일치율, 최고 적중 기록까지. 투명한 AI 성과 검증으로 신뢰할 수 있는 번호 추천.',
  openGraph: {
    title: 'AI 로또 적중 기록 - 실제 결과 공개 | 로또킹',
    description: 'AI 로또 예측 번호의 실제 적중 결과를 매주 공개합니다. 투명한 성과 검증!',
  },
  alternates: {
    canonical: 'https://lotto.gon.ai.kr/lotto/ai-hits',
  },
};

export default function AIHitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

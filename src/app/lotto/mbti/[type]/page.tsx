import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData } from '@/lib/dataFetcher';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { MBTI_TYPES, getMbtiProfile, MBTI_GROUP_INFO } from '@/data/mbtiLotto';
import MbtiContent from './MbtiContent';

interface Props {
  params: { type: string };
}

export const revalidate = 86400; // 24h

export function generateStaticParams() {
  return MBTI_TYPES.map(type => ({ type: type.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = getMbtiProfile(params.type);
  if (!profile) return { title: 'MBTI 로또번호 | 로또킹' };

  const title = `${profile.type} ${profile.name} 로또 행운번호 추천 ${profile.emoji} | 로또킹`;
  const description = `${profile.type}(${profile.name}) 성격에 맞는 로또 행운번호는 ${profile.luckyNumbers.join(', ')}! ${profile.trait}인 당신을 위한 맞춤 번호 추천, 구매 전략, MBTI 궁합 분석까지.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/mbti/${params.type.toLowerCase()}` },
    openGraph: {
      title: `${profile.type} ${profile.name} - 로또 행운번호 추천`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/mbti/${params.type.toLowerCase()}`,
    },
  };
}

export default async function MbtiPage({ params }: Props) {
  const profile = getMbtiProfile(params.type);
  if (!profile) notFound();

  const allData = await getAllLottoData();
  const totalRounds = allData.length;

  // 행운번호 6개의 실제 출현 통계
  const numberStats = profile.luckyNumbers.map(num => ({
    number: num,
    frequency: LottoStatisticsAnalyzer.calculateFrequency(num, allData),
    lastAppeared: LottoStatisticsAnalyzer.calculateLastAppeared(num, allData),
    hotColdScore: LottoStatisticsAnalyzer.calculateHotColdScore(num, allData),
  }));

  // 행운번호 6개 중 실제 당첨에 3개 이상 일치한 회차
  const matchedRounds = allData
    .map(r => {
      const matched = profile.luckyNumbers.filter(n => r.numbers.includes(n));
      return {
        round: r.round,
        date: r.drawDate,
        matchCount: matched.length,
        matchedNumbers: matched,
        numbers: r.numbers,
        bonus: r.bonusNumber,
      };
    })
    .filter(r => r.matchCount >= 3)
    .sort((a, b) => b.matchCount - a.matchCount || b.round - a.round)
    .slice(0, 10);

  // 비추천 번호 통계
  const avoidStats = profile.avoidNumbers.map(num => ({
    number: num,
    frequency: LottoStatisticsAnalyzer.calculateFrequency(num, allData),
  }));

  // 궁합 MBTI 프로필
  const bestPair = getMbtiProfile(profile.bestPairType);
  const worstPair = getMbtiProfile(profile.worstPairType);

  // 인접 MBTI 네비게이션
  const currentIdx = MBTI_TYPES.indexOf(profile.type);
  const prevType = MBTI_TYPES[(currentIdx - 1 + 16) % 16];
  const nextType = MBTI_TYPES[(currentIdx + 1) % 16];

  // FAQPage JSON-LD — all content from static data file (mbtiLotto.ts), not user input
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: profile.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  // Article JSON-LD — static content only
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${profile.type} ${profile.name} 로또 행운번호 추천`,
    description: `${profile.type} 성격에 맞는 로또 번호 추천과 구매 전략`,
    author: { '@type': 'Organization', name: 'AI 로또킹' },
    publisher: { '@type': 'Organization', name: 'AI 로또킹' },
    mainEntityOfPage: `https://lotto.gon.ai.kr/lotto/mbti/${params.type.toLowerCase()}`,
  };

  const groupInfo = MBTI_GROUP_INFO[profile.group];

  return (
    <>
      {/* JSON-LD: all values from static data file, safe from XSS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: 'MBTI 행운번호', href: '/lotto/mbti' },
          { label: `${profile.type} ${profile.name}` },
        ]}
      />

      <MbtiContent
        profile={profile}
        groupInfo={groupInfo}
        numberStats={numberStats}
        avoidStats={avoidStats}
        matchedRounds={matchedRounds}
        totalRounds={totalRounds}
        bestPair={bestPair ? { type: bestPair.type, name: bestPair.name, emoji: bestPair.emoji } : null}
        worstPair={worstPair ? { type: worstPair.type, name: worstPair.name, emoji: worstPair.emoji } : null}
        prevType={prevType}
        nextType={nextType}
      />
    </>
  );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData } from '@/lib/dataFetcher';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { BLOOD_TYPE_IDS, BLOOD_TYPE_PROFILES, getBloodTypeProfile } from '@/data/bloodTypeLotto';
import BloodTypeContent from './BloodTypeContent';

interface Props {
  params: { type: string };
}

export const revalidate = 86400;

export function generateStaticParams() {
  return BLOOD_TYPE_IDS.map(type => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = getBloodTypeProfile(params.type);
  if (!profile) return { title: '혈액형 로또번호 | 로또킹' };

  const title = `${profile.name} 로또 행운번호 추천 ${profile.emoji} | 로또킹`;
  const description = `${profile.name}(한국인 ${profile.percentage}) 행운번호는 ${profile.luckyNumbers.join(', ')}! ${profile.trait}인 당신을 위한 맞춤 번호 추천, 구매 전략, 혈액형 궁합까지.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/blood-type/${params.type}` },
    openGraph: {
      title: `${profile.name} ${profile.emoji} 로또 행운번호 추천`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/blood-type/${params.type}`,
    },
  };
}

export default async function BloodTypePage({ params }: Props) {
  const profile = getBloodTypeProfile(params.type);
  if (!profile) notFound();

  const allData = await getAllLottoData();
  const totalRounds = allData.length;

  const numberStats = profile.luckyNumbers.map(num => ({
    number: num,
    frequency: LottoStatisticsAnalyzer.calculateFrequency(num, allData),
    lastAppeared: LottoStatisticsAnalyzer.calculateLastAppeared(num, allData),
    hotColdScore: LottoStatisticsAnalyzer.calculateHotColdScore(num, allData),
  }));

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

  const avoidStats = profile.avoidNumbers.map(num => ({
    number: num,
    frequency: LottoStatisticsAnalyzer.calculateFrequency(num, allData),
  }));

  const bestPairProfile = getBloodTypeProfile(profile.bestPairId);
  const worstPairProfile = getBloodTypeProfile(profile.worstPairId);

  const currentIdx = BLOOD_TYPE_IDS.indexOf(profile.id as typeof BLOOD_TYPE_IDS[number]);
  const prevProfile = BLOOD_TYPE_PROFILES[(currentIdx - 1 + 4) % 4];
  const nextProfile = BLOOD_TYPE_PROFILES[(currentIdx + 1) % 4];

  // JSON-LD: all values sourced from static data file (bloodTypeLotto.ts), not user input
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: profile.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${profile.name} 로또 행운번호 추천`,
    description: `${profile.name} 성격에 맞는 로또 번호 추천과 구매 전략`,
    author: { '@type': 'Organization', name: 'AI 로또킹' },
    publisher: { '@type': 'Organization', name: 'AI 로또킹' },
    mainEntityOfPage: `https://lotto.gon.ai.kr/lotto/blood-type/${params.type}`,
  };

  return (
    <>
      {/* Safe: all JSON-LD values from static data file, not user input */}
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
          { label: '혈액형 행운번호', href: '/lotto/blood-type' },
          { label: `${profile.emoji} ${profile.name}` },
        ]}
      />

      <BloodTypeContent
        profile={profile}
        numberStats={numberStats}
        avoidStats={avoidStats}
        matchedRounds={matchedRounds}
        totalRounds={totalRounds}
        bestPair={bestPairProfile ? { id: bestPairProfile.id, name: bestPairProfile.name, emoji: bestPairProfile.emoji } : null}
        worstPair={worstPairProfile ? { id: worstPairProfile.id, name: worstPairProfile.name, emoji: worstPairProfile.emoji } : null}
        prevType={{ id: prevProfile.id, name: prevProfile.name }}
        nextType={{ id: nextProfile.id, name: nextProfile.name }}
      />
    </>
  );
}

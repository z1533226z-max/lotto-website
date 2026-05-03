import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData } from '@/lib/dataFetcher';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { ZODIAC_IDS, ZODIAC_PROFILES, getZodiacProfile, ELEMENT_INFO } from '@/data/zodiacLotto';
import ZodiacContent from './ZodiacContent';

interface Props {
  params: { sign: string };
}

export const revalidate = 86400;

export function generateStaticParams() {
  return ZODIAC_IDS.map(sign => ({ sign }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = getZodiacProfile(params.sign);
  if (!profile) return { title: '별자리 로또번호 | 로또킹' };

  const title = `${profile.name} 로또 행운번호 추천 ${profile.emoji} (${profile.dateRange}) | 로또킹`;
  const description = `${profile.name}(${profile.dateRange}) 행운번호는 ${profile.luckyNumbers.join(', ')}! ${profile.trait}인 당신을 위한 맞춤 번호 추천, 구매 전략, 별자리 궁합까지.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/zodiac/${params.sign}` },
    openGraph: {
      title: `${profile.name} ${profile.emoji} 로또 행운번호 추천`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/zodiac/${params.sign}`,
    },
  };
}

export default async function ZodiacPage({ params }: Props) {
  const profile = getZodiacProfile(params.sign);
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

  const bestPairProfile = getZodiacProfile(profile.bestPairId);
  const worstPairProfile = getZodiacProfile(profile.worstPairId);

  const currentIdx = ZODIAC_IDS.indexOf(profile.id as typeof ZODIAC_IDS[number]);
  const prevProfile = ZODIAC_PROFILES[(currentIdx - 1 + 12) % 12];
  const nextProfile = ZODIAC_PROFILES[(currentIdx + 1) % 12];

  // JSON-LD schemas - all values from static data file (zodiacLotto.ts), not user input
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
    mainEntityOfPage: `https://lotto.gon.ai.kr/lotto/zodiac/${params.sign}`,
  };

  const elementInfo = ELEMENT_INFO[profile.element];

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
          { label: '별자리 행운번호', href: '/lotto/zodiac' },
          { label: `${profile.emoji} ${profile.name}` },
        ]}
      />

      <ZodiacContent
        profile={profile}
        elementInfo={elementInfo}
        numberStats={numberStats}
        avoidStats={avoidStats}
        matchedRounds={matchedRounds}
        totalRounds={totalRounds}
        bestPair={bestPairProfile ? { id: bestPairProfile.id, name: bestPairProfile.name, emoji: bestPairProfile.emoji } : null}
        worstPair={worstPairProfile ? { id: worstPairProfile.id, name: worstPairProfile.name, emoji: worstPairProfile.emoji } : null}
        prevSign={{ id: prevProfile.id, name: prevProfile.name }}
        nextSign={{ id: nextProfile.id, name: nextProfile.name }}
      />
    </>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { MBTI_PROFILES, MBTI_GROUP_INFO } from '@/data/mbtiLotto';
import type { MbtiProfile } from '@/data/mbtiLotto';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'MBTI별 로또 행운번호 추천 - 16가지 성격유형 맞춤 번호 | 로또킹',
  description: 'MBTI 성격유형별 로또 행운번호를 추천합니다. INTJ, ENFP, ISTJ 등 16가지 유형에 맞는 번호 선택 전략, 구매 팁, MBTI 궁합까지 확인하세요.',
  alternates: { canonical: '/lotto/mbti' },
  openGraph: {
    title: 'MBTI별 로또 행운번호 추천',
    description: '16가지 MBTI 성격유형에 맞는 로또 행운번호와 구매 전략을 확인하세요.',
    url: 'https://lotto.gon.ai.kr/lotto/mbti',
  },
};

function getBallHexColor(num: number): string {
  if (num <= 10) return '#FFC107';
  if (num <= 20) return '#2196F3';
  if (num <= 30) return '#FF5722';
  if (num <= 40) return '#9E9E9E';
  return '#4CAF50';
}

function MiniLottoBall({ number }: { number: number }) {
  const bg = getBallHexColor(number);
  const text = number <= 10 ? '#333' : '#FFF';
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
      style={{ backgroundColor: bg, color: text }}
    >
      {number}
    </span>
  );
}

function MbtiCard({ profile }: { profile: MbtiProfile }) {
  const groupInfo = MBTI_GROUP_INFO[profile.group];
  return (
    <Link
      href={`/lotto/mbti/${profile.type.toLowerCase()}`}
      className="block bg-gray-800/60 rounded-xl p-5 border border-gray-700 hover:border-gray-500 transition-all hover:scale-[1.02]"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{profile.emoji}</span>
        <div>
          <div className="font-bold text-white text-lg">{profile.type}</div>
          <div className="text-sm text-gray-400">{profile.name}</div>
        </div>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: groupInfo.color }}
        >
          {groupInfo.name}
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{profile.trait}</p>
      <div className="flex gap-1.5">
        {profile.luckyNumbers.map(n => (
          <MiniLottoBall key={n} number={n} />
        ))}
      </div>
    </Link>
  );
}

export default function MbtiHubPage() {
  const groups = ['analyst', 'diplomat', 'sentinel', 'explorer'] as const;

  return (
    <>
      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: 'MBTI 행운번호' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            MBTI별 로또 행운번호
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            16가지 MBTI 성격유형에 맞는 로또 행운번호와 구매 전략을 확인하세요.
            당신의 성격에 딱 맞는 번호 선택 방법을 알려드립니다.
          </p>
        </header>

        {groups.map(groupKey => {
          const info = MBTI_GROUP_INFO[groupKey];
          const profiles = MBTI_PROFILES.filter(p => p.group === groupKey);
          return (
            <section key={groupKey}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                {info.emoji} {info.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profiles.map(p => (
                  <MbtiCard key={p.type} profile={p} />
                ))}
              </div>
            </section>
          );
        })}

        {/* 안내 텍스트 */}
        <section className="bg-gray-800/40 rounded-xl p-6 border border-gray-700 text-center">
          <h2 className="text-lg font-bold text-white mb-2">MBTI 로또번호란?</h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            MBTI 성격유형별 행운번호는 각 유형의 성격 특성에서 수비학적 에너지를 도출하여 추천하는 번호입니다.
            모든 로또 번호 조합은 수학적으로 동일한 당첨 확률을 가지므로,
            MBTI 행운번호는 재미와 참고용으로 활용해 주세요.
            실제 번호 선택 시에는 통계 분석도 함께 참고하시기 바랍니다.
          </p>
        </section>
      </div>
    </>
  );
}

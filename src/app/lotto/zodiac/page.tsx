import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { ZODIAC_PROFILES, ELEMENT_INFO } from '@/data/zodiacLotto';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: '별자리별 로또 행운번호 추천 - 12궁도 맞춤 번호 | 로또킹',
  description: '12별자리별 로또 행운번호를 추천합니다. 양자리, 황소자리, 쌍둥이자리 등 나의 별자리에 맞는 번호 선택 전략과 행운 요일을 확인하세요.',
  alternates: { canonical: '/lotto/zodiac' },
  openGraph: {
    title: '별자리별 로또 행운번호 추천',
    description: '12별자리 성격에 맞는 로또 행운번호와 구매 전략을 확인하세요.',
    url: 'https://lotto.gon.ai.kr/lotto/zodiac',
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

export default function ZodiacHubPage() {
  const elements = ['fire', 'earth', 'air', 'water'] as const;

  return (
    <>
      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: '별자리 행운번호' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            별자리별 로또 행운번호
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            12별자리 성격에 맞는 로또 행운번호와 구매 전략을 확인하세요.
            나의 별자리가 가진 행운의 에너지를 로또에 활용해 보세요.
          </p>
        </header>

        {elements.map(elementKey => {
          const info = ELEMENT_INFO[elementKey];
          const profiles = ZODIAC_PROFILES.filter(p => p.element === elementKey);
          return (
            <section key={elementKey}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                {info.emoji} {info.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map(p => (
                  <Link
                    key={p.id}
                    href={`/lotto/zodiac/${p.id}`}
                    className="block bg-gray-800/60 rounded-xl p-5 border border-gray-700 hover:border-gray-500 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <div className="font-bold text-white text-lg">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.dateRange}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{p.trait}</p>
                    <div className="flex gap-1.5 mb-2">
                      {p.luckyNumbers.map(n => (
                        <MiniLottoBall key={n} number={n} />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      행운 요일: {p.luckyDay} · 행운 색: {p.luckyColor}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <section className="bg-gray-800/40 rounded-xl p-6 border border-gray-700 text-center">
          <h2 className="text-lg font-bold text-white mb-2">별자리 로또번호란?</h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            별자리별 행운번호는 각 별자리의 수호성, 원소(불·흙·바람·물), 성격 특성에서 수비학적 에너지를 도출하여 추천하는 번호입니다.
            모든 로또 번호 조합은 수학적으로 동일한 당첨 확률을 가지므로,
            별자리 행운번호는 재미와 참고용으로 활용해 주세요.
          </p>
        </section>

        <section className="bg-gray-800/40 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-3">다른 유형별 행운번호</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/lotto/mbti" className="text-sm text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded-lg">
              MBTI별 행운번호
            </Link>
            <Link href="/lotto/blood-type" className="text-sm text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-1.5 rounded-lg">
              혈액형별 행운번호
            </Link>
            <Link href="/lotto/dream" className="text-sm text-purple-400 hover:text-purple-300 bg-purple-900/20 px-3 py-1.5 rounded-lg">
              꿈해몽 번호
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

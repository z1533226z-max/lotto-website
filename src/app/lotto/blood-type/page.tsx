import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { BLOOD_TYPE_PROFILES } from '@/data/bloodTypeLotto';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: '혈액형별 로또 행운번호 추천 - A형 B형 O형 AB형 맞춤 번호 | 로또킹',
  description: '혈액형별 로또 행운번호를 추천합니다. A형, B형, O형, AB형 성격에 맞는 번호 선택 전략, 구매 팁, 혈액형 궁합까지 확인하세요.',
  alternates: { canonical: '/lotto/blood-type' },
  openGraph: {
    title: '혈액형별 로또 행운번호 추천',
    description: 'A형, B형, O형, AB형 성격에 맞는 로또 행운번호와 구매 전략을 확인하세요.',
    url: 'https://lotto.gon.ai.kr/lotto/blood-type',
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

const BLOOD_COLORS: Record<string, string> = {
  a: '#E53935',
  b: '#1E88E5',
  o: '#43A047',
  ab: '#8E24AA',
};

export default function BloodTypeHubPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: '홈', href: '/' },
          { label: '혈액형 행운번호' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            혈액형별 로또 행운번호
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            A형, B형, O형, AB형 성격에 맞는 로또 행운번호와 구매 전략을 확인하세요.
            나의 혈액형이 가진 성격 에너지를 로또에 활용해 보세요.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {BLOOD_TYPE_PROFILES.map(p => (
            <Link
              key={p.id}
              href={`/lotto/blood-type/${p.id}`}
              className="block bg-gray-800/60 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <div className="font-bold text-white text-xl">{p.name}</div>
                  <div className="text-xs text-gray-400">한국인의 {p.percentage}</div>
                </div>
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: BLOOD_COLORS[p.id] }}
                >
                  {p.trait.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{p.trait}</p>
              <div className="flex gap-1.5 mb-2">
                {p.luckyNumbers.map(n => (
                  <MiniLottoBall key={n} number={n} />
                ))}
              </div>
            </Link>
          ))}
        </div>

        <section className="bg-gray-800/40 rounded-xl p-6 border border-gray-700 text-center">
          <h2 className="text-lg font-bold text-white mb-2">혈액형 로또번호란?</h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            혈액형별 행운번호는 각 혈액형의 성격 특성에서 수비학적 에너지를 도출하여 추천하는 번호입니다.
            A형의 꼼꼼함, B형의 직감, O형의 대범함, AB형의 독창성 등 각 혈액형의 강점을 로또 전략에 활용합니다.
            모든 로또 번호 조합은 수학적으로 동일한 당첨 확률을 가지므로, 재미와 참고용으로 활용해 주세요.
          </p>
        </section>

        <section className="bg-gray-800/40 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-3">다른 유형별 행운번호</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/lotto/zodiac" className="text-sm text-yellow-400 hover:text-yellow-300 bg-yellow-900/20 px-3 py-1.5 rounded-lg">
              별자리별 행운번호
            </Link>
            <Link href="/lotto/mbti" className="text-sm text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded-lg">
              MBTI별 행운번호
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

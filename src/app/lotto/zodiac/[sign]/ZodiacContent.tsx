'use client';

import Link from 'next/link';
import CrossSectionLinks from '@/components/lotto/CrossSectionLinks';

interface NumberStat {
  number: number;
  frequency: number;
  lastAppeared: number;
  hotColdScore: number;
}

interface AvoidStat {
  number: number;
  frequency: number;
}

interface MatchedRound {
  round: number;
  date: string;
  matchCount: number;
  matchedNumbers: number[];
  numbers: number[];
  bonus: number;
}

interface ZodiacPair {
  id: string;
  name: string;
  emoji: string;
}

interface Props {
  profile: {
    id: string;
    name: string;
    emoji: string;
    element: string;
    elementName: string;
    dateRange: string;
    trait: string;
    description: string;
    strategy: string;
    luckyNumbers: number[];
    avoidNumbers: number[];
    purchaseTip: string;
    luckyDay: string;
    luckyColor: string;
    faqs: { question: string; answer: string }[];
  };
  elementInfo: { name: string; emoji: string; color: string };
  numberStats: NumberStat[];
  avoidStats: AvoidStat[];
  matchedRounds: MatchedRound[];
  totalRounds: number;
  bestPair: ZodiacPair | null;
  worstPair: ZodiacPair | null;
  prevSign: { id: string; name: string };
  nextSign: { id: string; name: string };
}

function getBallHexColor(num: number): string {
  if (num <= 10) return '#FFC107';
  if (num <= 20) return '#2196F3';
  if (num <= 30) return '#FF5722';
  if (num <= 40) return '#9E9E9E';
  return '#4CAF50';
}

function getBallTextHexColor(num: number): string {
  if (num <= 10) return '#333333';
  return '#FFFFFF';
}

function LottoBall({ number, highlight }: { number: number; highlight?: boolean }) {
  const bg = getBallHexColor(number);
  const text = getBallTextHexColor(number);
  return (
    <span
      className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold text-base sm:text-lg select-none transition-transform duration-200 hover:scale-110"
      style={{
        background: `radial-gradient(circle at 35% 30%, ${bg}CC, ${bg} 50%, ${bg}99 100%)`,
        color: text,
        boxShadow: highlight
          ? `0 0 0 3px #FFD700, 0 4px 12px ${bg}66`
          : `0 4px 12px ${bg}66`,
      }}
    >
      {number}
    </span>
  );
}

function HotColdBadge({ score }: { score: number }) {
  if (score > 30) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">HOT</span>;
  if (score < -30) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">COLD</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">보통</span>;
}

export default function ZodiacContent({
  profile,
  elementInfo,
  numberStats,
  avoidStats,
  matchedRounds,
  totalRounds,
  bestPair,
  worstPair,
  prevSign,
  nextSign,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <header className="text-center space-y-3">
        <div
          className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: elementInfo.color }}
        >
          {elementInfo.emoji} {elementInfo.name}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          {profile.emoji} {profile.name} 로또 행운번호
        </h1>
        <p className="text-lg text-gray-300">{profile.trait}</p>
        <p className="text-sm text-gray-400">{profile.dateRange} | 행운 요일: {profile.luckyDay} | 행운 색: {profile.luckyColor}</p>
      </header>

      <section className="bg-gray-800/60 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-3">{profile.name}의 로또 성향</h2>
        <p className="text-gray-300 leading-relaxed">{profile.description}</p>
      </section>

      <section className="bg-gradient-to-br from-yellow-900/30 to-amber-900/20 rounded-xl p-6 border border-yellow-800/40">
        <h2 className="text-xl font-bold text-yellow-400 mb-4">{profile.name} 행운번호</h2>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {profile.luckyNumbers.map(n => (
            <LottoBall key={n} number={n} highlight />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {numberStats.map(stat => (
            <div key={stat.number} className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg font-bold text-white">{stat.number}번</span>
                <HotColdBadge score={stat.hotColdScore} />
              </div>
              <div className="text-sm text-gray-400">
                출현 {stat.frequency}회 ({(stat.frequency / totalRounds * 100).toFixed(1)}%)
              </div>
              <div className="text-xs text-gray-500">
                최근 {stat.lastAppeared}회 전
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-800/40 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-red-400 mb-3">피해야 할 번호</h2>
        <div className="flex flex-wrap gap-3 justify-center mb-3">
          {profile.avoidNumbers.map(n => (
            <span
              key={n}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg bg-gray-700 text-gray-400 border-2 border-red-900/40"
            >
              {n}
            </span>
          ))}
        </div>
        <div className="text-center text-sm text-gray-400">
          {profile.avoidNumbers.map((n, i) => (
            <span key={n}>
              {n}번 (출현 {avoidStats[i]?.frequency ?? 0}회)
              {i < profile.avoidNumbers.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 rounded-xl p-6 border border-blue-800/40">
        <h2 className="text-xl font-bold text-blue-400 mb-3">{profile.name} 맞춤 구매 전략</h2>
        <p className="text-gray-300 leading-relaxed mb-4">{profile.strategy}</p>
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800/30">
          <p className="text-sm font-semibold text-blue-300 mb-1">구매 팁</p>
          <p className="text-gray-300">{profile.purchaseTip}</p>
        </div>
      </section>

      <section className="bg-gray-800/60 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">로또 별자리 궁합</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestPair && (
            <Link
              href={`/lotto/zodiac/${bestPair.id}`}
              className="block bg-green-900/20 rounded-lg p-4 border border-green-800/40 hover:border-green-600 transition-colors"
            >
              <div className="text-sm font-semibold text-green-400 mb-1">최고 궁합</div>
              <div className="text-lg font-bold text-white">
                {bestPair.emoji} {bestPair.name}
              </div>
              <div className="text-sm text-gray-400 mt-1">함께 구매하면 시너지!</div>
            </Link>
          )}
          {worstPair && (
            <Link
              href={`/lotto/zodiac/${worstPair.id}`}
              className="block bg-red-900/20 rounded-lg p-4 border border-red-800/40 hover:border-red-600 transition-colors"
            >
              <div className="text-sm font-semibold text-red-400 mb-1">주의 궁합</div>
              <div className="text-lg font-bold text-white">
                {worstPair.emoji} {worstPair.name}
              </div>
              <div className="text-sm text-gray-400 mt-1">번호 선택 스타일이 달라요</div>
            </Link>
          )}
        </div>
      </section>

      {matchedRounds.length > 0 && (
        <section className="bg-gray-800/60 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            행운번호 실제 당첨 매칭 (3개 이상 일치)
          </h2>
          <div className="space-y-3">
            {matchedRounds.map(mr => (
              <Link
                key={mr.round}
                href={`/lotto/${mr.round}`}
                className="block bg-gray-700/40 rounded-lg p-4 hover:bg-gray-700/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-yellow-400">
                    {mr.round}회 ({mr.date})
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-300">
                    {mr.matchCount}개 일치
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mr.numbers.map(n => (
                    <span
                      key={n}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        mr.matchedNumbers.includes(n) ? 'ring-2 ring-yellow-400' : ''
                      }`}
                      style={{
                        backgroundColor: getBallHexColor(n),
                        color: getBallTextHexColor(n),
                      }}
                    >
                      {n}
                    </span>
                  ))}
                  <span className="text-gray-500 mx-1 self-center">+</span>
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: getBallHexColor(mr.bonus),
                      color: getBallTextHexColor(mr.bonus),
                    }}
                  >
                    {mr.bonus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gray-800/60 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">{profile.name} 로또 FAQ</h2>
        <div className="space-y-4">
          {profile.faqs.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-blue-300 font-semibold hover:text-blue-200 transition-colors">
                Q. {faq.question}
              </summary>
              <p className="mt-2 text-gray-300 pl-4 border-l-2 border-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
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

      <nav className="flex justify-between items-center py-4">
        <Link
          href={`/lotto/zodiac/${prevSign.id}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← {prevSign.name}
        </Link>
        <Link
          href="/lotto/zodiac"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          전체 별자리 보기
        </Link>
        <Link
          href={`/lotto/zodiac/${nextSign.id}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {nextSign.name} →
        </Link>
      </nav>

      <CrossSectionLinks current="zodiac" className="bg-gray-800/60 rounded-xl p-5 border border-gray-700" />
    </div>
  );
}

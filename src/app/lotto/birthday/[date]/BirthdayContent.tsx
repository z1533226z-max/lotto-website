'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import CrossSectionLinks from '@/components/lotto/CrossSectionLinks';

interface NumberStat {
  number: number;
  frequency: number;
  lastAppeared: number;
  hotColdScore: number;
}

interface MatchedRound {
  round: number;
  date: string;
  matchCount: number;
  matchedNumbers: number[];
  numbers: number[];
  bonus: number;
}

interface Props {
  month: number;
  day: number;
  numbers: number[];
  zodiac: { name: string; emoji: string; element: string; trait: string };
  luckyColor: { name: string; code: string };
  luckyDirection: string;
  luckyTime: string;
  fortuneMessage: string;
  lifePath: number;
  numberStats: NumberStat[];
  matchedRounds: MatchedRound[];
  totalRounds: number;
  prevDate: string;
  nextDate: string;
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

const LIFE_PATH_DESC: Record<number, string> = {
  1: '리더십과 독립심이 강한 개척자입니다. 자신만의 번호를 고수하세요.',
  2: '조화와 협력의 에너지입니다. 공동구매가 행운을 부를 수 있어요.',
  3: '창의성과 표현력이 뛰어납니다. 직감적으로 고른 번호가 좋습니다.',
  4: '안정과 체계를 중시합니다. 통계 기반 번호 선택이 잘 맞아요.',
  5: '변화와 자유를 사랑합니다. 매주 다른 번호를 시도해보세요.',
  6: '책임감과 사랑의 에너지입니다. 가족의 생일 번호가 행운을 줍니다.',
  7: '분석력과 영적 직관이 뛰어납니다. 조용한 곳에서 번호를 고르세요.',
  8: '성공과 물질적 풍요의 에너지입니다. 과감한 투자가 결실을 맺어요.',
  9: '인도주의적이고 이상적입니다. 나눔의 마음으로 구매하면 행운이 옵니다.',
  11: '영감과 직관의 마스터 넘버입니다. 꿈에서 본 번호를 기억하세요.',
  22: '현실화의 마스터 넘버입니다. 큰 꿈이 실현될 수 있는 특별한 에너지예요.',
};

function formatPrevNextDate(date: string): string {
  const [m, d] = date.split('-').map(Number);
  return `${m}월 ${d}일`;
}

export default function BirthdayContent({
  month, day, numbers, zodiac, luckyColor, luckyDirection, luckyTime,
  fortuneMessage, lifePath, numberStats, matchedRounds, totalRounds,
  prevDate, nextDate,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* 헤더: 생일 + 별자리 */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary, #6366f1))',
          color: 'white',
        }}
      >
        <div className="text-4xl sm:text-5xl mb-2">{zodiac.emoji}</div>
        <h1 className="text-2xl sm:text-3xl font-black mb-1">
          {month}월 {day}일 생일 행운번호
        </h1>
        <p className="text-sm sm:text-base opacity-90 mb-4">
          {zodiac.name} &middot; {zodiac.element} 원소 &middot; {zodiac.trait}
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {numbers.map(num => (
            <LottoBall key={num} number={num} />
          ))}
        </div>
        <p className="text-xs mt-4 opacity-75">
          * 생년월일 기반 결정론적 행운번호 (재미 목적)
        </p>
      </div>

      {/* 행운 운세 메시지 */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)' }}
      >
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
          {month}월 {day}일생 운세
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {fortuneMessage}
        </p>
      </div>

      {/* 행운 정보 3칸 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>행운의 색</p>
          <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ backgroundColor: luckyColor.code }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{luckyColor.name}</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>행운의 방향</p>
          <div className="text-xl mb-1">🧭</div>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{luckyDirection}</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>행운의 시간</p>
          <div className="text-xl mb-1">🕐</div>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{luckyTime}</p>
        </div>
      </div>

      {/* 수비학 생명수 */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)' }}
      >
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
          수비학 생명수: {lifePath}
          {(lifePath === 11 || lifePath === 22) && <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">마스터 넘버!</span>}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {LIFE_PATH_DESC[lifePath] || '독특한 에너지의 소유자입니다.'}
        </p>
      </div>

      {/* 행운번호별 실제 출현 통계 */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)' }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
          행운번호 실제 당첨 통계
        </h2>
        <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
          총 {totalRounds}회 추첨 기준
        </p>
        <div className="space-y-3">
          {numberStats.map(stat => (
            <div key={stat.number} className="flex items-center gap-3">
              <LottoBall number={stat.number} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {stat.frequency}회 출현
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    ({((stat.frequency / totalRounds) * 100).toFixed(1)}%)
                  </span>
                  <HotColdBadge score={stat.hotColdScore} />
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--surface-hover, #f3f4f6)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((stat.frequency / totalRounds) * 100 * 3.5, 100)}%`,
                      backgroundColor: getBallHexColor(stat.number),
                      opacity: 0.8,
                    }}
                  />
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  마지막 출현: {stat.lastAppeared > 0 ? `${stat.lastAppeared}회차` : '미출현'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 행운번호 일치 회차 */}
      {matchedRounds.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)' }}
        >
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            행운번호 일치 회차 (3개 이상)
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
            {month}월 {day}일 행운번호 6개 중 3개 이상 당첨된 회차
          </p>
          <div className="space-y-3">
            {matchedRounds.map(r => (
              <Link
                key={r.round}
                href={`/lotto/${r.round}`}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-200 hover:bg-black/5"
                style={{ border: '1px solid var(--border, #e5e7eb)' }}
              >
                <div className="text-center min-w-[60px]">
                  <div className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                    {r.round}회
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {r.date}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <LottoNumbers numbers={r.numbers} bonusNumber={r.bonus} size="xs" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {r.matchCount}개 일치
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 관련 링크 */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border, #e5e7eb)' }}
      >
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
          관련 분석
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {numbers.map(num => (
            <Link
              key={num}
              href={`/lotto/number/${num}`}
              className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-black/5 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: getBallHexColor(num),
                  color: getBallTextHexColor(num),
                }}
              >
                {num}
              </span>
              {num}번 분석
            </Link>
          ))}
          <Link
            href="/lotto/fortune"
            className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-black/5 text-sm col-span-2 sm:col-span-3"
            style={{ color: 'var(--primary)' }}
          >
            🎯 이름을 입력해서 번호에 변화를 주고 싶다면? &rarr; 행운번호 생성기
          </Link>
        </div>
      </div>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between">
        <Link
          href={`/lotto/birthday/${prevDate}`}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-black/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          &larr; {formatPrevNextDate(prevDate)}
        </Link>
        <Link
          href="/lotto/fortune"
          className="text-sm font-medium"
          style={{ color: 'var(--primary)' }}
        >
          전체 목록
        </Link>
        <Link
          href={`/lotto/birthday/${nextDate}`}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-black/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {formatPrevNextDate(nextDate)} &rarr;
        </Link>
      </div>

      <CrossSectionLinks current="birthday" theme="light" />

      {/* 면책조항 */}
      <div className="text-center">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          * 행운번호는 재미와 참고를 위한 것이며, 실제 당첨을 보장하지 않습니다.
          로또 6/45는 동행복권에서 운영합니다.
        </p>
      </div>
    </div>
  );
}

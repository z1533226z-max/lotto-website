import React from 'react';

// 공 색: LottoNumbers·홈과 같은 동행복권 공 색 (lib/constants 의 LOTTO_COLORS 는 Tailwind 클래스라 style 에 못 씀)
const ballBg = (n: number) => (n <= 10 ? '#FFC107' : n <= 20 ? '#2196F3' : n <= 30 ? '#FF5722' : n <= 40 ? '#757575' : '#4CAF50');
const ballText = (n: number) => (n <= 10 ? '#333333' : '#FFFFFF');

interface Props {
  numbers: number[];
  /** 당첨번호와 맞은 번호 — 주면 나머지는 흐리게 */
  matched?: number[];
  bonusMatched?: number | null;
  size?: 'sm' | 'md';
}

/** 내 번호 표시용 작은 공 (맞은 번호만 색, 나머지 회색) */
const TicketBalls: React.FC<Props> = ({ numbers, matched, bonusMatched = null, size = 'sm' }) => {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className="flex flex-wrap gap-1.5">
      {numbers.map(n => {
        const bonus = bonusMatched === n;
        const hit = !matched || matched.includes(n) || bonus;
        return (
          <span
            key={n}
            className={`${dim} rounded-full inline-flex items-center justify-center font-bold ${bonus ? 'ring-2 ring-yellow-400' : ''}`}
            style={hit
              ? { backgroundColor: ballBg(n), color: ballText(n) }
              : { backgroundColor: 'var(--surface-hover, #e5e7eb)', color: 'var(--text-tertiary, #9ca3af)' }}
            aria-label={`${n}${hit && matched ? ' 일치' : ''}`}
          >
            {n}
          </span>
        );
      })}
    </div>
  );
};

export default TicketBalls;

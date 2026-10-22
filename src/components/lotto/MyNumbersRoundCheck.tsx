'use client';

import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useMyNumbers } from '@/hooks/useMyNumbers';
import { checkTicket, getTargetRound, type DrawLike } from '@/lib/myNumbers';
import { getRankLabel } from '@/lib/lottoUtils';
import TicketBalls from './TicketBalls';

/** 회차 페이지: 브라우저에 저장한 내 번호를 이 회차 당첨번호와 비교 */
const MyNumbersRoundCheck: React.FC<{ draw: DrawLike }> = ({ draw }) => {
  const { entries, loaded } = useMyNumbers();
  const [showAll, setShowAll] = useState(false);

  const targeted = entries.filter(e => getTargetRound(e) === draw.round);
  const list = showAll ? entries.slice(-10).reverse() : targeted;

  return (
    <section className="bg-white/70 backdrop-blur-sm rounded-lg p-4 space-y-3" aria-labelledby="my-numbers-check">
      <div className="flex items-center justify-between gap-2">
        <h2 id="my-numbers-check" className="text-base font-bold text-gray-800">
          <Bookmark className="w-4 h-4 inline-block mr-1 text-primary align-text-bottom" />
          내 번호 {draw.round}회 당첨 확인
        </h2>
        <a href="/lotto/my-numbers" className="text-xs font-semibold text-primary hover:underline shrink-0">
          내 번호 관리 →
        </a>
      </div>

      {!loaded ? (
        <p className="text-sm text-gray-500">저장한 번호를 불러오는 중…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-600">
          번호를 저장해 두면 추첨 후 몇 개 맞았는지 자동으로 보여 드립니다. 가입 없이 이 브라우저에만 저장됩니다.{' '}
          <a href="/lotto/my-numbers" className="text-primary font-semibold hover:underline">번호 저장하기</a>
        </p>
      ) : (
        <>
          {list.length === 0 ? (
            <p className="text-sm text-gray-600">
              {draw.round}회를 대상으로 저장한 번호는 없습니다. 저장한 번호 {entries.length}세트를 이 회차와 비교해 볼 수 있습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {list.map(e => {
                const r = checkTicket(e.numbers, draw);
                return (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white/80 px-3 py-2">
                    <TicketBalls
                      numbers={e.numbers}
                      matched={r.matchedNumbers}
                      bonusMatched={r.matched === 5 && r.bonusMatched ? draw.bonusNumber : null}
                    />
                    <span className={`text-sm font-bold ${r.rank > 0 ? 'text-primary' : 'text-gray-500'}`}>
                      {r.matched}개 일치 · {getRankLabel(r.rank)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {!showAll && entries.length > targeted.length && (
            <button type="button" onClick={() => setShowAll(true)} className="text-xs font-semibold text-primary hover:underline">
              저장한 번호 전체(최근 10세트)를 이 회차와 비교
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default MyNumbersRoundCheck;

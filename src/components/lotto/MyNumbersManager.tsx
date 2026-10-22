'use client';

import React, { useMemo, useState } from 'react';
import { Bookmark, Trash2, Shuffle, Plus, Lock } from 'lucide-react';
import { useMyNumbers } from '@/hooks/useMyNumbers';
import { checkTicket, getTargetRound, MY_NUMBERS_MAX, type DrawLike, type MyNumberEntry } from '@/lib/myNumbers';
import { getDrawTimeMs, getNextDraw } from '@/lib/drawSchedule';
import { getRankLabel } from '@/lib/lottoUtils';
import { formatKstDrawTime } from '@/lib/kstFormat';
import { getShareUrl } from '@/lib/shareCode';
import { NumberGenerator as NumberGen } from '@/lib/numberGenerator';
import TicketBalls from './TicketBalls';
import ShareButtons from './ShareButtons';

interface Props {
  /** 최근 회차 당첨번호 (오래된 → 최신) */
  draws: DrawLike[];
  latestRound: number;
  /** 서버 렌더 시점의 다음 추첨 회차 */
  nextRound: number;
}

// 4·5등은 고정 당첨금 (동행복권 당첨금 지급 기준)
const FIXED_PRIZE: Record<number, string> = { 4: '5만원', 5: '5천원' };

const MyNumbersManager: React.FC<Props> = ({ draws, latestRound, nextRound }) => {
  const { entries, loaded, add, remove, clear } = useMyNumbers();
  const [picked, setPicked] = useState<number[]>([]);
  const [target, setTarget] = useState<'next' | 'latest'>('next');
  const [notice, setNotice] = useState('');

  const drawByRound = useMemo(() => new Map(draws.map(d => [d.round, d])), [draws]);
  const latestDraw = drawByRound.get(latestRound);

  const toggle = (n: number) => {
    setPicked(prev => (prev.includes(n) ? prev.filter(x => x !== n) : prev.length >= 6 ? prev : [...prev, n]));
  };

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleSave = () => {
    if (picked.length !== 6) return;
    const round = target === 'next' ? getNextDraw().round : latestRound;
    const ok = add([picked], { isAI: false, round });
    flash(ok ? `${round}회 번호로 저장했습니다` : '이 브라우저에서는 저장할 수 없습니다(사생활 보호 모드 등)');
    if (ok) setPicked([]);
    if (ok && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'my_numbers_saved', { source: 'manual', target });
    }
  };

  // 대상 회차 최신순으로 묶기
  const groups = useMemo(() => {
    const map = new Map<number, MyNumberEntry[]>();
    for (const e of entries) {
      const r = getTargetRound(e);
      map.set(r, [...(map.get(r) || []), e]);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [entries]);

  const latestSummary = useMemo(() => {
    if (!latestDraw) return null;
    const mine = entries.filter(e => getTargetRound(e) === latestRound);
    const wins = mine.map(e => checkTicket(e.numbers, latestDraw)).filter(r => r.rank > 0);
    return { total: mine.length, wins };
  }, [entries, latestDraw, latestRound]);

  return (
    <div className="space-y-6">
      {/* 최신 회차 요약 */}
      {loaded && latestSummary && latestSummary.total > 0 && (
        <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(211, 97, 53, 0.08)', border: '1px solid rgba(211, 97, 53, 0.2)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            {latestRound}회 결과: 저장한 {latestSummary.total}세트 중{' '}
            {latestSummary.wins.length > 0
              ? `${latestSummary.wins.length}세트 당첨 (${latestSummary.wins.map(w => getRankLabel(w.rank)).join(', ')})`
              : '당첨 없음'}
          </p>
        </div>
      )}

      {/* 번호 입력 */}
      <section className="rounded-xl p-4 sm:p-5 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>
            <Plus className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 번호 6개 고르기 ({picked.length}/6)
          </h2>
          <button
            type="button"
            onClick={() => setPicked(NumberGen.generateRandomNumbers())}
            className="text-xs font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-md hover:opacity-80"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <Shuffle className="w-3.5 h-3.5" /> 무작위
          </button>
        </div>
        <div className="grid grid-cols-9 gap-1.5" role="group" aria-label="번호 선택 1~45">
          {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
            const on = picked.includes(n);
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggle(n)}
                aria-pressed={on}
                className="aspect-square rounded-full text-xs sm:text-sm font-bold transition-colors"
                style={on
                  ? { background: '#D36135', color: '#fff' }
                  : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            대상 회차
            <select
              value={target}
              onChange={e => setTarget(e.target.value as 'next' | 'latest')}
              className="rounded-md px-2 py-1 text-sm"
              style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              <option value="next">다음 추첨 {nextRound}회</option>
              <option value="latest">지난 추첨 {latestRound}회</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleSave}
            disabled={picked.length !== 6}
            className="sm:ml-auto px-5 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #D36135, #C05430)' }}
          >
            <Bookmark className="w-4 h-4 inline-block mr-1 align-text-bottom" /> 내 번호로 저장
          </button>
        </div>
        {notice && <p className="text-sm font-medium text-green-600" role="status">{notice}</p>}
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <Lock className="w-3 h-3 inline-block mr-1" />
          가입 없이 이 브라우저에만 저장되며 서버로 보내지 않습니다. 브라우저 기록을 지우면 함께 지워집니다. 최대 {MY_NUMBERS_MAX}세트.
        </p>
      </section>

      {/* 저장 목록 */}
      <section className="space-y-4">
        <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>
          저장한 번호 {loaded ? `${entries.length}세트` : ''}
        </h2>
        {!loaded ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>불러오는 중…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            아직 저장한 번호가 없습니다. 위에서 고르거나 <a href="/#generator" className="text-primary font-semibold hover:underline">AI 추천번호</a>를 받은 뒤 저장하세요.
          </p>
        ) : (
          groups.map(([round, list]) => {
            const draw = drawByRound.get(round);
            const pending = round > latestRound;
            return (
              <div key={round} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                    {draw ? <a href={`/lotto/${round}`} className="hover:underline">{round}회</a> : `${round}회`}
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {pending
                      ? `추첨 전 · ${formatKstDrawTime(getDrawTimeMs(round))}`
                      : draw ? `당첨번호 ${draw.numbers.join(', ')} + ${draw.bonusNumber}` : '당첨번호 정보 없음'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {list.map(e => {
                    const r = draw ? checkTicket(e.numbers, draw) : null;
                    return (
                      <li key={e.id} className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <TicketBalls
                            numbers={e.numbers}
                            matched={r?.matchedNumbers}
                            bonusMatched={r && r.matched === 5 && r.bonusMatched ? draw!.bonusNumber : null}
                            size="md"
                          />
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${r && r.rank > 0 ? 'text-primary' : ''}`} style={r && r.rank > 0 ? undefined : { color: 'var(--text-secondary)' }}>
                              {r ? `${r.matched}개 일치 · ${getRankLabel(r.rank)}${FIXED_PRIZE[r.rank] ? ` (${FIXED_PRIZE[r.rank]})` : ''}` : pending ? '추첨 대기' : '-'}
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(e.id)}
                              className="p-1.5 rounded-md hover:opacity-70"
                              style={{ color: 'var(--text-tertiary)' }}
                              aria-label={`${e.numbers.join(', ')} 삭제`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {pending && (
                          <ShareButtons
                            url={getShareUrl(round, e.numbers)}
                            title={`이번 주 내 행운 번호 (${round}회)`}
                            text={`${e.numbers.join(', ')} — 로또킹에서 나도 번호 받기`}
                            className="!space-y-1"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
        {loaded && entries.length > 0 && (
          <button
            type="button"
            onClick={() => { if (window.confirm('저장한 번호를 모두 지울까요?')) clear(); }}
            className="text-xs hover:underline"
            style={{ color: 'var(--text-tertiary)' }}
          >
            전체 삭제
          </button>
        )}
      </section>
    </div>
  );
};

export default MyNumbersManager;

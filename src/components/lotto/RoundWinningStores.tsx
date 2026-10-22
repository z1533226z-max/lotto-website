import React from 'react';
import { Store } from 'lucide-react';
import {
  STORES_SOURCE_NOTE,
  STORE_TABLE_HEADERS,
  storesFallback,
  storesHeading,
  storesSummaryParts,
  type StoreLike,
} from '@/lib/roundContent';
import TextParts from './TextParts';

interface Props {
  round: number;
  firstWinners: number;
  /** null = 조회 실패/아직 수집 전 */
  stores: StoreLike[] | null;
}

const TYPE_STYLE: Record<StoreLike['purchaseType'], string> = {
  자동: 'bg-blue-50 text-blue-700',
  수동: 'bg-amber-50 text-amber-700',
  반자동: 'bg-purple-50 text-purple-700',
};

const HEADER_CLASS = ['py-2 px-1 w-8', 'py-2 px-1', 'py-2 px-1 w-16', 'py-2 px-1'];

/** 회차 1등 배출 판매점 목록 (서버 렌더 — 검색 로봇이 HTML 에서 바로 읽음, 글은 RSS 와 공용) */
const RoundWinningStores: React.FC<Props> = ({ round, firstWinners, stores }) => {
  const hasStores = !!stores && stores.length > 0;
  const fallback = storesFallback(round);

  return (
    <section className="bg-white/70 backdrop-blur-sm rounded-lg p-4 space-y-3" aria-labelledby="round-stores">
      <h2 id="round-stores" className="text-base font-bold text-gray-800">
        <Store className="w-4 h-4 inline-block mr-1 text-primary align-text-bottom" />
        {storesHeading(round)}
      </h2>

      {hasStores ? (
        <>
          <p className="text-sm text-gray-700"><TextParts parts={storesSummaryParts(round, firstWinners, stores)} /></p>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                  {STORE_TABLE_HEADERS.map((h, i) => (
                    <th key={h} scope="col" className={HEADER_CLASS[i]}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stores.map((s, i) => (
                  <tr key={`${s.name}-${s.address}`} className="border-b border-gray-100 align-top">
                    <td className="py-2 px-1 text-gray-400">{i + 1}</td>
                    <td className="py-2 px-1 font-medium text-gray-800 break-keep-all">{s.name}</td>
                    <td className="py-2 px-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_STYLE[s.purchaseType]}`}>{s.purchaseType}</span>
                    </td>
                    <td className="py-2 px-1 text-gray-600 break-keep-all">{s.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600">
          {fallback.before}
          <a href="/lotto/stores" className="text-primary hover:underline">{fallback.link}</a>{fallback.after}
        </p>
      )}
      <p className="text-xs text-gray-400">{STORES_SOURCE_NOTE}</p>
    </section>
  );
};

export default RoundWinningStores;

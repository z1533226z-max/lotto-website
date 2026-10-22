import React from 'react';
import { Store } from 'lucide-react';
import { countByPurchaseType, type RoundStore } from '@/lib/winningStores';

interface Props {
  round: number;
  firstWinners: number;
  /** null = 조회 실패/아직 수집 전 */
  stores: RoundStore[] | null;
}

const TYPE_STYLE: Record<RoundStore['purchaseType'], string> = {
  자동: 'bg-blue-50 text-blue-700',
  수동: 'bg-amber-50 text-amber-700',
  반자동: 'bg-purple-50 text-purple-700',
};

/** 회차 1등 배출 판매점 목록 (서버 렌더 — 검색 로봇이 HTML 에서 바로 읽음) */
const RoundWinningStores: React.FC<Props> = ({ round, firstWinners, stores }) => {
  const hasStores = !!stores && stores.length > 0;
  const counts = hasStores ? countByPurchaseType(stores) : null;

  return (
    <section className="bg-white/70 backdrop-blur-sm rounded-lg p-4 space-y-3" aria-labelledby="round-stores">
      <h2 id="round-stores" className="text-base font-bold text-gray-800">
        <Store className="w-4 h-4 inline-block mr-1 text-primary align-text-bottom" />
        로또 {round}회 1등 당첨 판매점
      </h2>

      {hasStores && counts ? (
        <>
          <p className="text-sm text-gray-700">
            {round}회 1등 배출점은 <strong>{stores.length}곳</strong>입니다
            (자동 {counts.자동} · 수동 {counts.수동} · 반자동 {counts.반자동}).
            {firstWinners > stores.length && ' 온라인(인터넷) 구매 당첨은 판매점 목록에 나오지 않을 수 있습니다.'}
          </p>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th scope="col" className="py-2 px-1 w-8">#</th>
                  <th scope="col" className="py-2 px-1">상호</th>
                  <th scope="col" className="py-2 px-1 w-16">구분</th>
                  <th scope="col" className="py-2 px-1">소재지</th>
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
          {round}회 1등 판매점 정보는 동행복권 발표 후 순차 반영됩니다. 지역별 명당은{' '}
          <a href="/lotto/stores" className="text-primary hover:underline">판매점 페이지</a>에서 볼 수 있습니다.
        </p>
      )}
      <p className="text-xs text-gray-400">
        자료: 동행복권 공개 1등 배출점 정보(제3자 공개 페이지에서 수집). 판매점 위치는 당첨 확률과 관계가 없습니다.
      </p>
    </section>
  );
};

export default RoundWinningStores;

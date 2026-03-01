'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StoreCard from '@/components/stores/StoreCard';
import StoreRanking from '@/components/stores/StoreRanking';
import RegionStats from '@/components/stores/RegionStats';
import type { WinningStore, RegionStats as RegionStatsType } from '@/types/database';
import { Store, Trophy, ClipboardList, BarChart3, Medal } from 'lucide-react';

// 지역 목록
const REGIONS = [
  '전체', '서울', '경기', '인천', '부산', '대구', '광주',
  '대전', '울산', '세종', '강원', '충북', '충남',
  '전북', '전남', '경북', '경남', '제주',
];

interface RankingStore {
  store_name: string;
  store_address: string;
  region: string;
  sub_region: string;
  win_count: number;
  last_round: number;
  rounds: number[];
}

type ViewMode = 'list' | 'ranking' | 'stats';

export default function StoresPage() {
  const [stores, setStores] = useState<WinningStore[]>([]);
  const [rankingStores, setRankingStores] = useState<RankingStore[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStatsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedRank] = useState<number | null>(1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('ranking');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion !== '전체') params.set('region', selectedRegion);
      if (selectedRank) params.set('rank', String(selectedRank));
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/stores?${params}`);
      const data = await res.json();

      if (data.success) {
        setStores(data.stores);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch {
      // 판매점 조회 실패
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedRank, page]);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('ranking', 'true');
      if (selectedRegion !== '전체') params.set('region', selectedRegion);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/stores?${params}`);
      const data = await res.json();

      if (data.success) {
        setRankingStores(data.ranking);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch {
      // 판매점 랭킹 조회 실패
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, page]);

  const fetchRegionStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stores?stats=region');
      const data = await res.json();
      if (data.success) {
        setRegionStats(data.stats);
      }
    } catch {
      // 지역 통계 조회 실패
    }
  }, []);

  // 뷰 모드에 따라 데이터 fetch
  useEffect(() => {
    if (viewMode === 'list') {
      fetchStores();
    } else if (viewMode === 'ranking') {
      fetchRanking();
    }
  }, [viewMode, fetchStores, fetchRanking]);

  useEffect(() => {
    fetchRegionStats();
  }, [fetchRegionStats]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [selectedRegion, viewMode]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-3">
            <Store className="w-7 h-7 inline-block mr-2" /> 1등 당첨 판매점
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            로또 1등 당첨 판매점 정보를 확인하세요.
            당첨 횟수별 랭킹과 지역별 통계를 한눈에 볼 수 있습니다.
          </p>
        </div>

        {/* 뷰 모드 토글 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant={viewMode === 'ranking' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('ranking')}
          >
            <Trophy className="w-4 h-4 inline-block mr-1" /> 당첨 랭킹
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ClipboardList className="w-4 h-4 inline-block mr-1" /> 회차별 목록
          </Button>
          <Button
            variant={viewMode === 'stats' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('stats')}
          >
            <BarChart3 className="w-4 h-4 inline-block mr-1" /> 지역 통계
          </Button>
        </div>

        {viewMode === 'stats' ? (
          /* 지역별 통계 뷰 */
          <Card variant="glass" padding="lg">
            <RegionStats stats={regionStats} />
          </Card>
        ) : (
          <>
            {/* 필터 */}
            <Card variant="glass" padding="md" className="mb-6">
              <div className="space-y-4">
                {/* 지역 필터 */}
                <div>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                    지역 선택
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((region) => (
                      <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                          selectedRegion === region
                            ? 'bg-primary text-white shadow-glow'
                            : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--surface-active)]'
                        )}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 결과 건수 */}
                <div className="flex items-center gap-3">
                  <Badge variant="warning">
                    {viewMode === 'ranking' ? <><Trophy className="w-3.5 h-3.5 inline-block mr-1" /> 당첨 랭킹</> : <><Medal className="w-3.5 h-3.5 inline-block mr-1" /> 1등 판매점</>}
                  </Badge>
                  <div className="ml-auto">
                    <Badge variant="info">
                      총 {total.toLocaleString()}{viewMode === 'ranking' ? '개 판매점' : '건'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* 목록 */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-xl bg-[var(--surface)] animate-pulse"
                  />
                ))}
              </div>
            ) : viewMode === 'ranking' ? (
              /* 랭킹 뷰 */
              rankingStores.length === 0 ? (
                <Card variant="default" className="text-center py-12">
                  <p className="mb-4"><Trophy className="w-10 h-10 mx-auto" /></p>
                  <p className="text-lg font-medium text-[var(--text)]">
                    랭킹 데이터가 없습니다
                  </p>
                </Card>
              ) : (
                <>
                  <StoreRanking ranking={rankingStores} page={page} limit={20} />

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  )}
                </>
              )
            ) : (
              /* 회차별 목록 뷰 */
              stores.length === 0 ? (
                <Card variant="default" className="text-center py-12">
                  <p className="mb-4"><Store className="w-10 h-10 mx-auto" /></p>
                  <p className="text-lg font-medium text-[var(--text)]">
                    판매점 정보가 없습니다
                  </p>
                </Card>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {stores.map((store) => (
                      <StoreCard key={store.id} store={store} />
                    ))}
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  )}
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* 페이지네이션 컴포넌트 */
function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        ← 이전
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
          const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          if (pageNum > totalPages) return null;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                page === pageNum
                  ? 'bg-primary text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
              )}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        다음 →
      </Button>
    </div>
  );
}

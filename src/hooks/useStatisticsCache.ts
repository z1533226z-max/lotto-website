// 통계 데이터 클라이언트 캐시 훅

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NumberStatistics } from '@/types/lotto';
import { safeLocalStorage } from '@/lib/utils';

interface CachedStatistics {
  data: NumberStatistics[];
  summary: any;
  timestamp: string;
  version: string;
  maxRound: number;
  totalRounds: number;
}

interface UseStatisticsCacheOptions {
  maxRound?: number;
  forceRefresh?: boolean;
  enableClientCache?: boolean;
}

interface UseStatisticsCacheReturn {
  statistics: NumberStatistics[] | null;
  summary: any | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  lastUpdated: string | null;
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

const CACHE_VERSION = 'v1.2';
const CACHE_KEY = 'lotto-statistics-v1';
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

export function useStatisticsCache(options: UseStatisticsCacheOptions = {}): UseStatisticsCacheReturn {
  const {
    maxRound,
    forceRefresh = false,
    enableClientCache = true
  } = options;
  
  const [statistics, setStatistics] = useState<NumberStatistics[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // 로컬스토리지에서 캐시 로드
  const loadFromCache = useCallback((): CachedStatistics | null => {
    if (!enableClientCache) return null;
    
    try {
      const jsonData = safeLocalStorage.getItem(CACHE_KEY);
      if (!jsonData) return null;
      
      const cacheData = JSON.parse(jsonData) as CachedStatistics;
      
      // 버전 확인
      if (cacheData.version !== CACHE_VERSION) {
        safeLocalStorage.removeItem(CACHE_KEY);
        return null;
      }

      // 만료 시간 확인
      const cacheTime = new Date(cacheData.timestamp).getTime();
      const now = Date.now();
      const isExpired = (now - cacheTime) > CACHE_DURATION;

      if (isExpired) {
        safeLocalStorage.removeItem(CACHE_KEY);
        return null;
      }

      // 요청된 회차 이상인지 확인
      if (maxRound && cacheData.maxRound < maxRound) {
        return null;
      }

      // 데이터 유효성 확인
      if (!Array.isArray(cacheData.data) || cacheData.data.length !== 45) {
        safeLocalStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cacheData;

    } catch {
      safeLocalStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, [enableClientCache, maxRound]);
  
  // 로컬스토리지에 캐시 저장
  const saveToCache = useCallback((stats: NumberStatistics[], summaryData: any, maxRoundUsed: number) => {
    if (!enableClientCache) return;
    
    try {
      const cacheData: CachedStatistics = {
        data: stats,
        summary: summaryData,
        timestamp: new Date().toISOString(),
        version: CACHE_VERSION,
        maxRound: maxRoundUsed,
        totalRounds: maxRoundUsed
      };
      
      const jsonData = JSON.stringify(cacheData);
      safeLocalStorage.setItem(CACHE_KEY, jsonData);
    } catch {
      // 캐시 저장 실패 시 무시
    }
  }, [enableClientCache]);
  
  // API에서 데이터 가져오기
  const fetchFromAPI = useCallback(async (refresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `/api/lotto/statistics${maxRound ? `?maxRound=${maxRound}` : ''}${refresh ? (maxRound ? '&' : '?') + 'refresh=true' : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: API 호출 실패`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API 응답 오류');
      }
      
      const { statistics: statsData, summary: summaryData } = result.data;
      
      // 데이터 유효성 확인
      if (!Array.isArray(statsData) || statsData.length !== 45) {
        throw new Error('API에서 받은 통계 데이터가 유효하지 않습니다');
      }
      
      // 상태 업데이트
      setStatistics(statsData);
      setSummary(summaryData);
      setFromCache(result.source?.includes('cache') || false);
      setLastUpdated(result.timestamp);
      
      // 캐시에 저장 (서버 캐시가 아닌 경우만)
      if (!result.source?.includes('cache')) {
        saveToCache(statsData, summaryData, maxRound || result.data?.maxRound || 0);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [maxRound, saveToCache]);
  
  // 캐시 삭제
  const clearCache = useCallback(() => {
    if (enableClientCache) {
      safeLocalStorage.removeItem(CACHE_KEY);
    }
  }, [enableClientCache]);
  
  // 데이터 새로고침
  const refreshData = useCallback(async () => {
    clearCache();
    await fetchFromAPI(true);
  }, [clearCache, fetchFromAPI]);
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      // 강제 새로고침이 아니면 캐시 먼저 확인
      if (!forceRefresh) {
        const cachedData = loadFromCache();
        
        if (cachedData) {
          setStatistics(cachedData.data);
          setSummary(cachedData.summary);
          setFromCache(true);
          setLastUpdated(cachedData.timestamp);
          setLoading(false);
          return;
        }
      }
      
      // 캐시가 없거나 강제 새로고침인 경우 API 호출
      await fetchFromAPI(forceRefresh);
    };
    
    loadData();
  }, [forceRefresh, loadFromCache, fetchFromAPI]);
  
  return {
    statistics,
    summary,
    loading,
    error,
    fromCache,
    lastUpdated,
    refreshData,
    clearCache
  };
}
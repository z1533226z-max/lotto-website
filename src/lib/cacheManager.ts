// 통계 데이터 캐싱 관리자 (Vercel 서버리스 호환)

import type { NumberStatistics } from '@/types/lotto';
import { safeLocalStorage } from './utils';

export interface CachedStatistics {
  data: NumberStatistics[];
  summary: any;
  timestamp: string;
  version: string;
  maxRound: number;
  totalRounds: number;
}

export interface CacheMetadata {
  lastUpdated: string;
  maxRound: number;
  totalRounds: number;
  cacheSize: number;
  isValid: boolean;
}

// 인메모리 캐시 (서버 사이드)
let memoryCache: CachedStatistics | null = null;
const MEMORY_CACHE_TTL = 60 * 60 * 1000; // 1시간

export class LottoCacheManager {
  private static readonly CACHE_VERSION = 'v2.0';
  private static readonly CACHE_KEY = 'lotto-statistics-v2';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

  /**
   * 서버 사이드 인메모리 캐시에 저장
   */
  static saveToFileCache(statistics: NumberStatistics[], summary: any, maxRound: number): boolean {
    try {
      memoryCache = {
        data: statistics,
        summary,
        timestamp: new Date().toISOString(),
        version: this.CACHE_VERSION,
        maxRound,
        totalRounds: statistics.length > 0 ? maxRound : 0,
      };
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 서버 사이드 인메모리 캐시에서 로드
   */
  static loadFromFileCache(): CachedStatistics | null {
    if (!memoryCache) return null;

    const cacheTime = new Date(memoryCache.timestamp).getTime();
    if (Date.now() - cacheTime > MEMORY_CACHE_TTL) {
      memoryCache = null;
      return null;
    }

    return memoryCache;
  }

  /**
   * 클라이언트 사이드 로컬스토리지에 저장
   */
  static saveToLocalStorage(statistics: NumberStatistics[], summary: any, maxRound: number): boolean {
    try {
      const cacheData: CachedStatistics = {
        data: statistics,
        summary,
        timestamp: new Date().toISOString(),
        version: this.CACHE_VERSION,
        maxRound,
        totalRounds: statistics.length > 0 ? maxRound : 0,
      };
      return safeLocalStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      return false;
    }
  }

  /**
   * 클라이언트 사이드 로컬스토리지에서 로드
   */
  static loadFromLocalStorage(): CachedStatistics | null {
    try {
      const jsonData = safeLocalStorage.getItem(this.CACHE_KEY);
      if (!jsonData) return null;

      const cacheData = JSON.parse(jsonData) as CachedStatistics;
      if (cacheData.version !== this.CACHE_VERSION) {
        this.clearLocalStorage();
        return null;
      }

      const cacheTime = new Date(cacheData.timestamp).getTime();
      if (Date.now() - cacheTime > this.CACHE_DURATION) {
        this.clearLocalStorage();
        return null;
      }

      if (!Array.isArray(cacheData.data) || cacheData.data.length !== 45) {
        this.clearLocalStorage();
        return null;
      }

      return cacheData;
    } catch {
      this.clearLocalStorage();
      return null;
    }
  }

  static clearLocalStorage(): boolean {
    return safeLocalStorage.removeItem(this.CACHE_KEY);
  }

  static clearFileCache(): boolean {
    memoryCache = null;
    return true;
  }

  static clearAllCaches(): boolean {
    this.clearFileCache();
    this.clearLocalStorage();
    return true;
  }

  static getCacheMetadata(): CacheMetadata {
    if (memoryCache) {
      return {
        lastUpdated: memoryCache.timestamp,
        maxRound: memoryCache.maxRound,
        totalRounds: memoryCache.totalRounds,
        cacheSize: 0,
        isValid: true,
      };
    }
    return {
      lastUpdated: 'N/A',
      maxRound: 0,
      totalRounds: 0,
      cacheSize: 0,
      isValid: false,
    };
  }

  static isCacheValid(minRounds: number = 100): boolean {
    const metadata = this.getCacheMetadata();
    return metadata.isValid && metadata.totalRounds >= minRounds;
  }

  static generateCacheReport(): string {
    const metadata = this.getCacheMetadata();
    return [
      '=== 캐시 상태 ===',
      `유효: ${metadata.isValid}`,
      `최대 회차: ${metadata.maxRound}`,
      `총 회차: ${metadata.totalRounds}`,
    ].join('\n');
  }
}

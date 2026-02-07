// 인메모리 캐시 기반 로또 데이터 관리
// Vercel 서버리스 환경 호환 (SQLite 제거)

import type { LottoResult, NumberStatistics, DatabaseStats } from '@/types/lotto';

// 모듈 스코프 캐시 (warm 인스턴스 간 유지)
const lottoCache = new Map<number, LottoResult>();
const statsCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL = 60 * 60 * 1000; // 1시간

export class LottoDatabase {
  constructor(_dbPath?: string) {
    // 인메모리 캐시 사용 - dbPath 무시
  }

  async connect(): Promise<void> {
    // 인메모리 캐시는 연결 불필요
  }

  async close(): Promise<void> {
    // 인메모리 캐시는 연결 해제 불필요
  }

  async initializeSchema(): Promise<void> {
    // 인메모리 캐시는 스키마 불필요
  }

  async insertLottoResult(result: LottoResult): Promise<void> {
    lottoCache.set(result.round, result);
  }

  async insertLottoResults(results: LottoResult[]): Promise<void> {
    for (const result of results) {
      lottoCache.set(result.round, result);
    }
  }

  async getLottoResults(startRound?: number, endRound?: number): Promise<LottoResult[]> {
    const results: LottoResult[] = [];
    lottoCache.forEach((data, round) => {
      if ((!startRound || round >= startRound) && (!endRound || round <= endRound)) {
        results.push(data);
      }
    });
    return results.sort((a, b) => a.round - b.round);
  }

  async saveStatisticsCache(
    maxRound: number,
    statistics: NumberStatistics[],
    hotNumbers: NumberStatistics[],
    coldNumbers: NumberStatistics[]
  ): Promise<void> {
    statsCache.set(`stats_${maxRound}`, {
      data: { statistics, hotNumbers, coldNumbers },
      timestamp: Date.now(),
    });
  }

  async getStatisticsCache(maxRound: number): Promise<{
    statistics: NumberStatistics[];
    hotNumbers: NumberStatistics[];
    coldNumbers: NumberStatistics[];
  } | null> {
    const cached = statsCache.get(`stats_${maxRound}`);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    const rounds: number[] = [];
    lottoCache.forEach((_, round) => rounds.push(round));
    return {
      totalRounds: lottoCache.size,
      latestRound: rounds.length > 0 ? Math.max(...rounds) : 0,
      earliestRound: rounds.length > 0 ? Math.min(...rounds) : 0,
      lastUpdated: new Date(),
    };
  }
}

// 싱글톤 데이터베이스 인스턴스
let dbInstance: LottoDatabase | null = null;

export function getDatabaseInstance(): LottoDatabase {
  if (!dbInstance) {
    dbInstance = new LottoDatabase();
  }
  return dbInstance;
}

export default LottoDatabase;

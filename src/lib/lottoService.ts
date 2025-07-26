// 데이터베이스 기반 로또 서비스 레이어
// SQLite 데이터베이스를 사용한 고성능 로또 데이터 서비스

import path from 'path';
import { LottoDatabase } from './database';
import { LottoStatisticsAnalyzer } from './statisticsAnalyzer';
import type { LottoResult, NumberStatistics, DatabaseStats } from '@/types/lotto';

// 서비스 설정
interface LottoServiceConfig {
  cacheEnabled: boolean;
  cacheMaxAge: number; // 밀리초
  databasePath?: string;
}

const DEFAULT_CONFIG: LottoServiceConfig = {
  cacheEnabled: true,
  cacheMaxAge: 5 * 60 * 1000, // 5분
};

export class LottoService {
  private db: LottoDatabase;
  private config: LottoServiceConfig;
  private statisticsCache: Map<string, { data: NumberStatistics[], timestamp: number }>;
  private lottoDataCache: Map<string, { data: LottoResult[], timestamp: number }>;

  constructor(config: Partial<LottoServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.db = new LottoDatabase(config.databasePath);
    this.statisticsCache = new Map();
    this.lottoDataCache = new Map();
  }

  // 데이터베이스 연결 초기화
  async initialize(): Promise<void> {
    try {
      await this.db.connect();
      console.log('LottoService: 데이터베이스 연결 성공');
    } catch (error) {
      console.error('LottoService: 데이터베이스 연결 실패:', error);
      throw error;
    }
  }

  // 로또 데이터 조회 (캐시 지원)
  async getLottoResults(startRound?: number, endRound?: number): Promise<LottoResult[]> {
    const cacheKey = `lotto_${startRound || 'all'}_${endRound || 'all'}`;
    
    // 캐시 확인
    if (this.config.cacheEnabled) {
      const cached = this.lottoDataCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheMaxAge) {
        console.log(`LottoService: 캐시에서 로또 데이터 반환 (${cacheKey})`);
        return cached.data;
      }
    }

    try {
      console.log(`LottoService: 데이터베이스에서 로또 데이터 조회 (${startRound || 1}~${endRound || 'latest'}회차)`);
      const data = await this.db.getLottoResults(startRound, endRound);
      
      // 캐시 저장
      if (this.config.cacheEnabled) {
        this.lottoDataCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      console.log(`LottoService: ${data.length}개 회차 데이터 반환`);
      return data;
    } catch (error) {
      console.error('LottoService: 로또 데이터 조회 실패:', error);
      throw error;
    }
  }

  // 통계 데이터 생성 및 조회 (캐시 지원)
  async getStatistics(maxRound?: number): Promise<NumberStatistics[]> {
    const cacheKey = `stats_${maxRound || 'all'}`;
    
    // 캐시 확인
    if (this.config.cacheEnabled) {
      const cached = this.statisticsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheMaxAge) {
        console.log(`LottoService: 캐시에서 통계 데이터 반환 (${cacheKey})`);
        return cached.data;
      }
    }

    try {
      console.log(`LottoService: 통계 데이터 생성 시작 (최대 ${maxRound || 'all'}회차)`);
      
      // 1. 데이터베이스 캐시 확인
      if (maxRound) {
        const dbCache = await this.db.getStatisticsCache(maxRound);
        if (dbCache) {
          console.log(`LottoService: 데이터베이스 캐시에서 통계 반환 (${maxRound}회차)`);
          
          // 메모리 캐시에도 저장
          if (this.config.cacheEnabled) {
            this.statisticsCache.set(cacheKey, {
              data: dbCache.statistics,
              timestamp: Date.now()
            });
          }
          
          return dbCache.statistics;
        }
      }

      // 2. 로또 데이터 조회
      const lottoData = await this.getLottoResults(1, maxRound);
      
      if (lottoData.length === 0) {
        throw new Error('통계 생성을 위한 로또 데이터가 없습니다');
      }

      // 3. 통계 분석 수행
      console.log(`LottoService: ${lottoData.length}개 회차 데이터로 통계 분석 중...`);
      const statistics = LottoStatisticsAnalyzer.generateStatistics(lottoData);
      
      // 4. 핫/콜드 번호 계산
      const hotNumbers = LottoStatisticsAnalyzer.getHotNumbers(statistics, 10);
      const coldNumbers = LottoStatisticsAnalyzer.getColdNumbers(statistics, 10);

      // 5. 데이터베이스 캐시에 저장
      if (maxRound) {
        await this.db.saveStatisticsCache(maxRound, statistics, hotNumbers, coldNumbers);
        console.log(`LottoService: 통계 캐시 저장 완료 (${maxRound}회차)`);
      }

      // 6. 메모리 캐시에 저장
      if (this.config.cacheEnabled) {
        this.statisticsCache.set(cacheKey, {
          data: statistics,
          timestamp: Date.now()
        });
      }

      console.log(`LottoService: 통계 분석 완료 (${statistics.length}개 번호)`);
      return statistics;

    } catch (error) {
      console.error('LottoService: 통계 데이터 생성 실패:', error);
      throw error;
    }
  }

  // 핫/콜드 번호 조회
  async getHotColdNumbers(maxRound?: number, count: number = 10): Promise<{
    hotNumbers: NumberStatistics[],
    coldNumbers: NumberStatistics[]
  }> {
    try {
      // 1. 데이터베이스 캐시에서 먼저 확인
      if (maxRound) {
        const dbCache = await this.db.getStatisticsCache(maxRound);
        if (dbCache) {
          return {
            hotNumbers: dbCache.hotNumbers.slice(0, count),
            coldNumbers: dbCache.coldNumbers.slice(0, count)
          };
        }
      }

      // 2. 통계 데이터로부터 계산
      const statistics = await this.getStatistics(maxRound);
      const hotNumbers = LottoStatisticsAnalyzer.getHotNumbers(statistics, count);
      const coldNumbers = LottoStatisticsAnalyzer.getColdNumbers(statistics, count);

      return { hotNumbers, coldNumbers };

    } catch (error) {
      console.error('LottoService: 핫/콜드 번호 조회 실패:', error);
      throw error;
    }
  }

  // 최신 로또 결과 조회
  async getLatestResult(): Promise<LottoResult | null> {
    try {
      const results = await this.getLottoResults();
      return results.length > 0 ? results[results.length - 1] : null;
    } catch (error) {
      console.error('LottoService: 최신 결과 조회 실패:', error);
      return null;
    }
  }

  // 특정 회차 결과 조회
  async getResultByRound(round: number): Promise<LottoResult | null> {
    try {
      const results = await this.getLottoResults(round, round);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`LottoService: ${round}회차 결과 조회 실패:`, error);
      return null;
    }
  }

  // 데이터베이스 통계 조회
  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      return await this.db.getDatabaseStats();
    } catch (error) {
      console.error('LottoService: 데이터베이스 통계 조회 실패:', error);
      throw error;
    }
  }

  // 캐시 비우기
  clearCache(): void {
    this.statisticsCache.clear();
    this.lottoDataCache.clear();
    console.log('LottoService: 캐시 초기화 완료');
  }

  // 캐시 상태 조회
  getCacheStatus(): {
    statisticsCacheSize: number,
    lottoDataCacheSize: number,
    config: LottoServiceConfig
  } {
    return {
      statisticsCacheSize: this.statisticsCache.size,
      lottoDataCacheSize: this.lottoDataCache.size,
      config: this.config
    };
  }

  // 서비스 종료 (데이터베이스 연결 해제)
  async close(): Promise<void> {
    try {
      await this.db.close();
      this.clearCache();
      console.log('LottoService: 서비스 종료 완료');
    } catch (error) {
      console.error('LottoService: 서비스 종료 실패:', error);
    }
  }

  // 건강 상태 체크
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy',
    database: boolean,
    cache: boolean,
    dataCount: number,
    lastUpdated: string
  }> {
    try {
      const stats = await this.getDatabaseStats();
      
      return {
        status: stats.totalRounds > 0 ? 'healthy' : 'unhealthy',
        database: true,
        cache: this.config.cacheEnabled,
        dataCount: stats.totalRounds,
        lastUpdated: stats.lastUpdated.toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: false,
        cache: this.config.cacheEnabled,
        dataCount: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

// 싱글톤 서비스 인스턴스
let serviceInstance: LottoService | null = null;

export async function getLottoService(): Promise<LottoService> {
  if (!serviceInstance) {
    serviceInstance = new LottoService();
    await serviceInstance.initialize();
  }
  return serviceInstance;
}

// API 호환 레이어 (기존 API와 동일한 인터페이스 제공)
export class LottoApiCompatLayer {
  private service: LottoService;

  constructor(service: LottoService) {
    this.service = service;
  }

  // 기존 statistics API와 호환
  async getStatisticsAPI(maxRound?: number): Promise<{
    success: boolean,
    data?: {
      statistics: NumberStatistics[],
      rawData: LottoResult[]
    },
    error?: string
  }> {
    try {
      const statistics = await this.service.getStatistics(maxRound);
      const rawData = await this.service.getLottoResults(1, maxRound);
      
      return {
        success: true,
        data: {
          statistics,
          rawData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  // 기존 results API와 호환
  async getResultsAPI(round?: number): Promise<{
    success: boolean,
    data?: LottoResult,
    error?: string
  }> {
    try {
      const result = round 
        ? await this.service.getResultByRound(round)
        : await this.service.getLatestResult();
      
      if (!result) {
        return {
          success: false,
          error: '해당 회차 데이터를 찾을 수 없습니다'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }
}

export default LottoService;

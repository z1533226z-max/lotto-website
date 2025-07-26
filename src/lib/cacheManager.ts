// 통계 데이터 캐싱 관리자

import fs from 'fs';
import path from 'path';
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

export class LottoCacheManager {
  private static readonly CACHE_VERSION = 'v1.2';
  private static readonly CACHE_KEY = 'lotto-statistics-v1';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 (ms)
  private static readonly FILE_PATH = path.join(process.cwd(), 'public', 'data', 'lotto-statistics.json');
  
  /**
   * 서버 사이드 파일 캐시에 통계 데이터 저장 (압축 최적화)
   */
  static saveToFileCache(statistics: NumberStatistics[], summary: any, maxRound: number): boolean {
    try {
      console.time('Cache Save Optimization');
      
      // 메모리 사용량 측정 시작
      const beforeMemory = process.memoryUsage();
      
      // 통계 데이터 압축 최적화
      const optimizedStatistics = statistics.map(stat => ({
        n: stat.number,                    // number -> n
        f: stat.frequency,                 // frequency -> f  
        l: stat.lastAppeared,             // lastAppeared -> l
        h: Math.round(stat.hotColdScore), // hotColdScore -> h (반올림)
        c: stat.consecutiveCount          // consecutiveCount -> c
      }));
      
      // 요약 정보도 압축
      const optimizedSummary = {
        tr: summary.totalRounds,           // totalRounds -> tr
        tn: summary.totalNumbers,          // totalNumbers -> tn
        af: Math.round(summary.averageFrequency * 100) / 100, // 소수점 2자리로 제한
        mf: summary.mostFrequent,          // mostFrequent -> mf
        lf: summary.leastFrequent,         // leastFrequent -> lf
        hn: summary.hottestNumber,         // hottestNumber -> hn
        cn: summary.coldestNumber          // coldestNumber -> cn
      };
      
      const cacheData: CachedStatistics = {
        data: optimizedStatistics as any, // 압축된 형태로 저장
        summary: optimizedSummary,
        timestamp: new Date().toISOString(),
        version: this.CACHE_VERSION,
        maxRound,
        totalRounds: statistics.length > 0 ? maxRound : 0
      };
      
      // 디렉토리 존재 확인 및 생성
      const dir = path.dirname(this.FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // JSON 파일로 저장 (최대 압축)
      const jsonData = JSON.stringify(cacheData, null, 0);
      fs.writeFileSync(this.FILE_PATH, jsonData, 'utf8');
      
      // 메모리 사용량 측정 완료
      const afterMemory = process.memoryUsage();
      const memoryDelta = {
        rss: afterMemory.rss - beforeMemory.rss,
        heapUsed: afterMemory.heapUsed - beforeMemory.heapUsed,
        heapTotal: afterMemory.heapTotal - beforeMemory.heapTotal
      };
      
      console.log(`통계 데이터 파일 캐시 저장 완료: ${(jsonData.length / 1024).toFixed(1)}KB`);
      console.log(`압축률: ${((1 - jsonData.length / (JSON.stringify(statistics).length + JSON.stringify(summary).length)) * 100).toFixed(1)}%`);
      console.log(`메모리 변화: RSS ${(memoryDelta.rss / 1024 / 1024).toFixed(1)}MB, Heap ${(memoryDelta.heapUsed / 1024 / 1024).toFixed(1)}MB`);
      
      console.timeEnd('Cache Save Optimization');
      return true;
      
    } catch (error) {
      console.error('파일 캐시 저장 실패:', error);
      return false;
    }
  }
  
  /**
   * 서버 사이드 파일 캐시에서 통계 데이터 로드 (압축 해제)
   */
  static loadFromFileCache(): CachedStatistics | null {
    try {
      console.time('Cache Load Optimization');
      
      if (!fs.existsSync(this.FILE_PATH)) {
        console.log('파일 캐시가 존재하지 않습니다.');
        return null;
      }
      
      const beforeMemory = process.memoryUsage();
      
      const jsonData = fs.readFileSync(this.FILE_PATH, 'utf8');
      const cacheData = JSON.parse(jsonData) as CachedStatistics;
      
      // 버전 확인
      if (cacheData.version !== this.CACHE_VERSION) {
        console.log(`캐시 버전 불일치: ${cacheData.version} !== ${this.CACHE_VERSION}`);
        return null;
      }
      
      // 만료 시간 확인
      const cacheTime = new Date(cacheData.timestamp).getTime();
      const now = Date.now();
      const isExpired = (now - cacheTime) > this.CACHE_DURATION;
      
      if (isExpired) {
        console.log('파일 캐시가 만료되었습니다.');
        return null;
      }
      
      // 압축된 데이터 복원
      let restoredData = cacheData.data;
      let restoredSummary = cacheData.summary;
      
      // 압축 해제 (새 압축 형식인지 확인)
      if (Array.isArray(cacheData.data) && cacheData.data[0] && 'n' in cacheData.data[0]) {
        console.log('압축된 캐시 데이터를 복원 중...');
        restoredData = (cacheData.data as any).map((stat: any) => ({
          number: stat.n,
          frequency: stat.f,
          lastAppeared: stat.l,
          hotColdScore: stat.h,
          consecutiveCount: stat.c
        }));
        
        // 요약 정보도 복원
        if (cacheData.summary && 'tr' in cacheData.summary) {
          const s = cacheData.summary as any;
          restoredSummary = {
            totalRounds: s.tr,
            totalNumbers: s.tn,
            averageFrequency: s.af,
            mostFrequent: s.mf,
            leastFrequent: s.lf,
            hottestNumber: s.hn,
            coldestNumber: s.cn
          };
        }
      }
      
      // 데이터 유효성 간단 확인
      if (!Array.isArray(restoredData) || restoredData.length !== 45) {
        console.log('파일 캐시 데이터가 유효하지 않습니다.');
        return null;
      }
      
      const afterMemory = process.memoryUsage();
      const memoryDelta = {
        rss: afterMemory.rss - beforeMemory.rss,
        heapUsed: afterMemory.heapUsed - beforeMemory.heapUsed
      };
      
      console.log(`파일 캐시 로드 성공: ${restoredData.length}개 번호, ${cacheData.totalRounds}회차 데이터`);
      console.log(`캐시 파일 크기: ${(jsonData.length / 1024).toFixed(1)}KB`);
      console.log(`메모리 사용량: ${(memoryDelta.heapUsed / 1024 / 1024).toFixed(1)}MB`);
      
      console.timeEnd('Cache Load Optimization');
      
      return {
        ...cacheData,
        data: restoredData,
        summary: restoredSummary
      };
      
    } catch (error) {
      console.error('파일 캐시 로드 실패:', error);
      return null;
    }
  }
  
  /**
   * 클라이언트 사이드 로컬스토리지에 통계 데이터 저장
   */
  static saveToLocalStorage(statistics: NumberStatistics[], summary: any, maxRound: number): boolean {
    try {
      const cacheData: CachedStatistics = {
        data: statistics,
        summary,
        timestamp: new Date().toISOString(),
        version: this.CACHE_VERSION,
        maxRound,
        totalRounds: statistics.length > 0 ? maxRound : 0
      };
      
      const jsonData = JSON.stringify(cacheData);
      const success = safeLocalStorage.setItem(this.CACHE_KEY, jsonData);
      
      if (success) {
        console.log(`로컬스토리지 캐시 저장 완료: ${(jsonData.length / 1024).toFixed(1)}KB`);
      }
      
      return success;
      
    } catch (error) {
      console.error('로컬스토리지 캐시 저장 실패:', error);
      return false;
    }
  }
  
  /**
   * 클라이언트 사이드 로컬스토리지에서 통계 데이터 로드
   */
  static loadFromLocalStorage(): CachedStatistics | null {
    try {
      const jsonData = safeLocalStorage.getItem(this.CACHE_KEY);
      if (!jsonData) {
        console.log('로컬스토리지 캐시가 존재하지 않습니다.');
        return null;
      }
      
      const cacheData = JSON.parse(jsonData) as CachedStatistics;
      
      // 버전 확인
      if (cacheData.version !== this.CACHE_VERSION) {
        console.log(`로컬스토리지 캐시 버전 불일치: ${cacheData.version} !== ${this.CACHE_VERSION}`);
        this.clearLocalStorage();
        return null;
      }
      
      // 만료 시간 확인
      const cacheTime = new Date(cacheData.timestamp).getTime();
      const now = Date.now();
      const isExpired = (now - cacheTime) > this.CACHE_DURATION;
      
      if (isExpired) {
        console.log('로컬스토리지 캐시가 만료되었습니다.');
        this.clearLocalStorage();
        return null;
      }
      
      // 데이터 유효성 간단 확인
      if (!Array.isArray(cacheData.data) || cacheData.data.length !== 45) {
        console.log('로컬스토리지 캐시 데이터가 유효하지 않습니다.');
        this.clearLocalStorage();
        return null;
      }
      
      console.log(`로컬스토리지 캐시 로드 성공: ${cacheData.data.length}개 번호, ${cacheData.totalRounds}회차 데이터`);
      return cacheData;
      
    } catch (error) {
      console.error('로컬스토리지 캐시 로드 실패:', error);
      this.clearLocalStorage();
      return null;
    }
  }
  
  /**
   * 로컬스토리지 캐시 삭제
   */
  static clearLocalStorage(): boolean {
    return safeLocalStorage.removeItem(this.CACHE_KEY);
  }
  
  /**
   * 파일 캐시 삭제
   */
  static clearFileCache(): boolean {
    try {
      if (fs.existsSync(this.FILE_PATH)) {
        fs.unlinkSync(this.FILE_PATH);
        console.log('파일 캐시 삭제 완료');
        return true;
      }
      return true;
    } catch (error) {
      console.error('파일 캐시 삭제 실패:', error);
      return false;
    }
  }
  
  /**
   * 모든 캐시 삭제
   */
  static clearAllCaches(): boolean {
    const fileResult = this.clearFileCache();
    const localResult = this.clearLocalStorage();
    return fileResult && localResult;
  }
  
  /**
   * 캐시 메타데이터 조회
   */
  static getCacheMetadata(): CacheMetadata {
    const fileExists = fs.existsSync(this.FILE_PATH);
    let metadata: CacheMetadata = {
      lastUpdated: 'N/A',
      maxRound: 0,
      totalRounds: 0,
      cacheSize: 0,
      isValid: false
    };
    
    if (fileExists) {
      try {
        const stats = fs.statSync(this.FILE_PATH);
        const jsonData = fs.readFileSync(this.FILE_PATH, 'utf8');
        const cacheData = JSON.parse(jsonData) as CachedStatistics;
        
        const cacheTime = new Date(cacheData.timestamp).getTime();
        const now = Date.now();
        const isExpired = (now - cacheTime) > this.CACHE_DURATION;
        const isValidVersion = cacheData.version === this.CACHE_VERSION;
        const isValidData = Array.isArray(cacheData.data) && cacheData.data.length === 45;
        
        metadata = {
          lastUpdated: cacheData.timestamp,
          maxRound: cacheData.maxRound || 0,
          totalRounds: cacheData.totalRounds || 0,
          cacheSize: stats.size,
          isValid: !isExpired && isValidVersion && isValidData
        };
        
      } catch (error) {
        console.error('캐시 메타데이터 조회 실패:', error);
      }
    }
    
    return metadata;
  }
  
  /**
   * 캐시가 유효한지 확인 (최소 회차 수 체크 포함)
   */
  static isCacheValid(minRounds: number = 100): boolean {
    const metadata = this.getCacheMetadata();
    return metadata.isValid && metadata.totalRounds >= minRounds;
  }
  
  /**
   * 캐시 상태 보고서 생성
   */
  static generateCacheReport(): string {
    const metadata = this.getCacheMetadata();
    const localCache = this.loadFromLocalStorage();
    
    const report = [
      '=== 로또 통계 캐시 상태 보고서 ===',
      `파일 캐시 상태: ${metadata.isValid ? '유효' : '무효/없음'}`,
      `최종 업데이트: ${metadata.lastUpdated}`,
      `최대 회차: ${metadata.maxRound}회차`,
      `총 처리 회차: ${metadata.totalRounds}회차`,
      `파일 크기: ${(metadata.cacheSize / 1024).toFixed(1)}KB`,
      `로컬스토리지 캐시: ${localCache ? '존재' : '없음'}`,
      `캐시 버전: ${this.CACHE_VERSION}`,
      `캐시 유효기간: ${this.CACHE_DURATION / (60 * 60 * 1000)}시간`,
      '=========================================='
    ];
    
    return report.join('\n');
  }
}
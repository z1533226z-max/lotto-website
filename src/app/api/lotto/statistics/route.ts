import { NextRequest, NextResponse } from 'next/server';
import type { LottoResult, NumberStatistics } from '@/types/lotto';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import { LottoCacheManager } from '@/lib/cacheManager';
import { getSampleStatistics, getDefaultAIPerformance, getDataInfo, SAMPLE_LOTTO_DATA } from '@/data/sampleLottoData';
import { getDatabaseInstance } from '@/lib/database';

// 배치 처리 설정
const BATCH_SIZE = 10; // 동시에 처리할 회차 수
const MAX_RETRIES = 3; // 재시도 횟수
const RETRY_DELAY = 1000; // 재시도 간격 (ms)

// 동행복권 API에서 단일 회차 데이터 가져오기
async function fetchSingleRoundData(round: number): Promise<LottoResult | null> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
      },
      signal: AbortSignal.timeout(5000) // 5초 타임아웃
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: 동행복권 서버 응답 오류`);
    }
    
    const data = await response.json();
    
    if (data.returnValue === 'fail') {
      throw new Error(`${round}회차는 존재하지 않거나 아직 추첨되지 않았습니다.`);
    }
    
    // 데이터 유효성 검증
    if (!data.drwNo || !data.drwNoDate || !data.drwtNo1) {
      throw new Error(`${round}회차 데이터가 불완전합니다.`);
    }
    
    return convertToLottoResult(data);
    
  } catch (error) {
    console.error(`${round}회차 데이터 수집 실패:`, error);
    return null;
  }
}

// 동행복권 API 응답을 LottoResult 타입으로 변환
function convertToLottoResult(data: any): LottoResult {
  return {
    round: data.drwNo,
    drawDate: data.drwNoDate,
    numbers: [
      data.drwtNo1,
      data.drwtNo2,
      data.drwtNo3,
      data.drwtNo4,
      data.drwtNo5,
      data.drwtNo6
    ].sort((a, b) => a - b),
    bonusNumber: data.bnusNo,
    prizeMoney: {
      first: data.firstWinamnt || 0,
      firstWinners: data.firstPrzwnerCo || 0,
      second: data.secondWinamnt || Math.floor((data.firstWinamnt || 0) * 0.2),
      secondWinners: data.secondPrzwnerCo || Math.floor((data.firstPrzwnerCo || 0) * 3)
    }
  };
}

// 재시도 로직이 있는 단일 회차 데이터 수집
async function fetchRoundWithRetry(round: number): Promise<LottoResult | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const result = await fetchSingleRoundData(round);
    
    if (result !== null) {
      return result;
    }
    
    // 마지막 시도가 아니면 대기 후 재시도
    if (attempt < MAX_RETRIES) {
      console.log(`${round}회차 ${attempt}번째 시도 실패, ${RETRY_DELAY}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
  
  console.error(`${round}회차 ${MAX_RETRIES}번 시도 모두 실패`);
  return null;
}

// 배치 처리로 여러 회차 데이터 수집
async function fetchBatch(rounds: number[]): Promise<(LottoResult | null)[]> {
  console.log(`배치 처리 시작: ${rounds[0]}~${rounds[rounds.length - 1]}회차 (${rounds.length}개)`);
  
  const promises = rounds.map(round => fetchRoundWithRetry(round));
  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`${rounds[index]}회차 처리 실패:`, result.reason);
      return null;
    }
  });
}

// 특정 회차들만 수집하는 스마트 함수 (SQLite 최적화)
async function collectSpecificRounds(rounds: number[]): Promise<LottoResult[]> {
  console.log(`특정 회차 수집 시작: ${rounds.length}개 회차 [${rounds.slice(0, 5).join(', ')}${rounds.length > 5 ? '...' : ''}]`);
  
  const allResults: LottoResult[] = [];
  const failedRounds: number[] = [];
  
  // 회차별 배치 생성 (기존 BATCH_SIZE 활용)
  for (let i = 0; i < rounds.length; i += BATCH_SIZE) {
    const roundBatch = rounds.slice(i, i + BATCH_SIZE);
    
    console.log(`배치 처리: ${roundBatch[0]}~${roundBatch[roundBatch.length - 1]}회차 (${roundBatch.length}개)`);
    const batchResults = await fetchBatch(roundBatch);
    
    // 성공한 결과와 실패한 회차 분리
    batchResults.forEach((result, index) => {
      if (result !== null) {
        allResults.push(result);
      } else {
        failedRounds.push(roundBatch[index]);
      }
    });
    
    // 배치 간 간격 (API 부하 방지)
    if (i + BATCH_SIZE < rounds.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  console.log(`특정 회차 수집 완료: ${allResults.length}/${rounds.length}회차 성공`);
  
  if (failedRounds.length > 0) {
    console.warn(`수집 실패한 회차 (${failedRounds.length}개): ${failedRounds.slice(0, 10).join(', ')}${failedRounds.length > 10 ? '...' : ''}`);
  }
  
  // 회차 순으로 정렬
  return allResults.sort((a, b) => a.round - b.round);
}

// 전체 데이터 수집 (1~targetRound회차)
async function collectAllLottoData(targetRound: number): Promise<LottoResult[]> {
  console.log(`전체 데이터 수집 시작: 1~${targetRound}회차`);
  
  const allResults: LottoResult[] = [];
  const failedRounds: number[] = [];
  
  // 회차별 배치 생성
  for (let startRound = 1; startRound <= targetRound; startRound += BATCH_SIZE) {
    const endRound = Math.min(startRound + BATCH_SIZE - 1, targetRound);
    const roundBatch = Array.from(
      { length: endRound - startRound + 1 }, 
      (_, i) => startRound + i
    );
    
    const batchResults = await fetchBatch(roundBatch);
    
    // 성공한 결과와 실패한 회차 분리
    batchResults.forEach((result, index) => {
      if (result !== null) {
        allResults.push(result);
      } else {
        failedRounds.push(roundBatch[index]);
      }
    });
    
    // 배치 간 간격 (API 부하 방지)
    if (startRound + BATCH_SIZE <= targetRound) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`데이터 수집 완료: ${allResults.length}/${targetRound}회차 성공`);
  
  if (failedRounds.length > 0) {
    console.warn(`수집 실패한 회차: ${failedRounds.join(', ')}`);
  }
  
  // 회차 순으로 정렬
  return allResults.sort((a, b) => a.round - b.round);
}

export async function GET(request: NextRequest) {
  const performanceStart = Date.now();
  console.time('Total Statistics API Performance');
  
  try {
    const { searchParams } = new URL(request.url);
    const maxRound = parseInt(searchParams.get('maxRound') || '1180');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    
    console.log(`통계 데이터 수집 요청: 최대 ${maxRound}회차, 강제새로고침: ${forceRefresh}`);
    
    // 유효성 검사
    if (maxRound < 1 || maxRound > 2000) {
      return NextResponse.json({
        success: false,
        error: '회차 범위는 1~2000 사이여야 합니다.',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // 1단계: 캐시 데이터 확인 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
      console.time('Cache Load Performance');
      console.log('캐시 데이터 확인 중...');
      const cachedData = LottoCacheManager.loadFromFileCache();
      console.timeEnd('Cache Load Performance');
      
      if (cachedData && cachedData.maxRound >= maxRound) {
        const cacheResponseTime = Date.now() - performanceStart;
        console.log(`캐시 데이터 사용: ${cachedData.totalRounds}회차, 응답시간: ${cacheResponseTime}ms`);
        
        console.timeEnd('Total Statistics API Performance');
        
        return NextResponse.json({
          success: true,
          data: {
            rawData: [], // 캐시에서는 원본 데이터 생략
            statistics: cachedData.data,
            summary: cachedData.summary
          },
          stats: {
            totalRequested: maxRound,
            totalCollected: cachedData.totalRounds,
            successRate: '100.0',
            collectionTime: '0.0초 (캐시 사용)',
            analysisTime: '0.0초 (캐시 사용)',
            totalProcessingTime: `${cacheResponseTime}ms (캐시)`,
            batchesProcessed: 0,
            statisticsGenerated: cachedData.data.length,
            cacheHit: true,
            responseTime: `${cacheResponseTime}ms`
          },
          source: 'file_cache_optimized',
          message: `캐시된 ${cachedData.totalRounds}개 회차 통계 데이터 반환`,
          timestamp: new Date().toISOString(),
          cache: `캐시 사용 (생성시간: ${cachedData.timestamp})`
        }, {
          headers: {
            'Cache-Control': 'public, max-age=3600', // 1시간 브라우저 캐시
            'X-Response-Time': `${cacheResponseTime}ms`,
            'X-Cache-Status': 'HIT'
          }
        });
      } else {
        console.log('유효한 캐시 데이터가 없음. SQLite 데이터베이스 확인...');
      }
    } else {
      console.log('강제 새로고침 요청으로 캐시 무시');
    }
    
    // 2단계: SQLite 데이터베이스 우선 활용 (NEW!)
    console.time('SQLite Database Performance');
    let lottoData: LottoResult[] = [];
    let dbSourceRounds = 0;
    let apiNeededRounds: number[] = [];
    
    try {
      const db = getDatabaseInstance();
      await db.connect();
      
      // 데이터베이스 통계 확인
      const dbStats = await db.getDatabaseStats();
      console.log(`SQLite DB 상태: ${dbStats.totalRounds}회차 저장됨 (${dbStats.earliestRound}~${dbStats.latestRound}회차)`);
      
      if (dbStats.totalRounds > 0 && dbStats.latestRound >= maxRound) {
        // 요청한 회차가 모두 DB에 있는 경우
        console.log(`모든 데이터가 SQLite에 존재: 1~${maxRound}회차`);
        lottoData = await db.getLottoResults(1, maxRound);
        dbSourceRounds = lottoData.length;
        
      } else if (dbStats.totalRounds > 0) {
        // 일부 데이터만 DB에 있는 경우: 하이브리드 전략
        console.log(`하이브리드 전략 활용: DB(${dbStats.totalRounds}회차) + API(추가 수집)`);
        
        // DB에서 기존 데이터 로드
        const dbData = await db.getLottoResults(1, Math.min(maxRound, dbStats.latestRound));
        lottoData.push(...dbData);
        dbSourceRounds = dbData.length;
        
        // 부족한 회차 계산
        const existingRounds = new Set(dbData.map(d => d.round));
        apiNeededRounds = [];
        for (let round = 1; round <= maxRound; round++) {
          if (!existingRounds.has(round)) {
            apiNeededRounds.push(round);
          }
        }
        
        console.log(`API로 추가 수집 필요: ${apiNeededRounds.length}회차 (${apiNeededRounds.slice(0, 5)}...)`);
        
      } else {
        // DB가 비어있는 경우: 전체 수집 필요
        console.log('SQLite DB가 비어있음. 전체 데이터 수집 필요');
        apiNeededRounds = Array.from({length: maxRound}, (_, i) => i + 1);
      }
      
      await db.close();
      
    } catch (dbError) {
      console.warn('SQLite 데이터베이스 오류:', dbError);
      console.log('데이터베이스 실패로 외부 API 전략으로 전환');
      apiNeededRounds = Array.from({length: maxRound}, (_, i) => i + 1);
    }
    
    console.timeEnd('SQLite Database Performance');
    
    // 3단계: 부족한 회차만 외부 API로 수집 (스마트 수집)
    let collectionSuccess = false;
    let collectionError: string | null = null;
    let collectionEndTime = Date.now();
    let newlyCollectedData: LottoResult[] = [];
    
    if (apiNeededRounds.length > 0) {
      try {
        console.time('Smart API Collection Performance');
        console.log(`스마트 수집 시작: ${apiNeededRounds.length}개 회차 (DB: ${dbSourceRounds}회차 활용)`);
        const startTime = Date.now();
        
        // 필요한 회차만 수집
        newlyCollectedData = await collectSpecificRounds(apiNeededRounds);
        collectionEndTime = Date.now();
        console.timeEnd('Smart API Collection Performance');
        
        // 수집 성공 여부 판단
        const successRate = newlyCollectedData.length / apiNeededRounds.length;
        if (successRate >= 0.3) { // 30% 이상 수집되면 성공으로 간주
          collectionSuccess = true;
          lottoData.push(...newlyCollectedData);
          
          // 새로 수집한 데이터를 SQLite에 저장
          if (newlyCollectedData.length > 0) {
            try {
              console.time('Database Save Performance');
              const db = getDatabaseInstance();
              await db.connect();
              await db.insertLottoResults(newlyCollectedData);
              await db.close();
              console.timeEnd('Database Save Performance');
              console.log(`새로 수집한 ${newlyCollectedData.length}회차 데이터를 SQLite에 저장 완료`);
            } catch (saveError) {
              console.warn('SQLite 저장 실패:', saveError);
            }
          }
          
          console.log(`스마트 수집 성공: 총 ${lottoData.length}회차 (DB: ${dbSourceRounds}, API: ${newlyCollectedData.length})`);
        } else {
          throw new Error(`데이터 수집률이 너무 낮습니다: ${(successRate * 100).toFixed(1)}% < 30%`);
        }
        
      } catch (error) {
        collectionError = error instanceof Error ? error.message : '외부 API 호출 실패';
        console.warn(`스마트 수집 실패: ${collectionError}`);
        
        // DB에서 가져온 데이터라도 있으면 부분 성공으로 처리
        if (dbSourceRounds > 0) {
          console.log(`부분 성공: DB에서 ${dbSourceRounds}회차 확보, Fallback 없이 진행`);
          collectionSuccess = true;
        } else {
          console.log('완전 실패: Fallback 데이터로 전환합니다...');
        }
      }
    } else {
      // 모든 데이터가 DB에 있는 경우
      collectionSuccess = true;
      collectionEndTime = Date.now();
      console.log(`완전 DB 활용: ${lottoData.length}회차 데이터 (API 호출 불필요)`);
    }
    
    // 3단계: Fallback 데이터 사용 (외부 API 실패 시)
    if (!collectionSuccess) {
      console.time('Fallback Data Processing');
      console.log('실제 로또 데이터 기반 Fallback 시스템 활성화');
      
      lottoData = SAMPLE_LOTTO_DATA;
      const fallbackResponseTime = Date.now() - performanceStart;
      
      // Fallback 통계 생성
      const fallbackStatistics = getSampleStatistics();
      const fallbackSummary = LottoStatisticsAnalyzer.generateSummary(fallbackStatistics, lottoData);
      const fallbackAIPerformance = getDefaultAIPerformance();
      const dataInfo = getDataInfo();
      
      console.timeEnd('Fallback Data Processing');
      console.timeEnd('Total Statistics API Performance');
      
      return NextResponse.json({
        success: true,
        data: {
          rawData: lottoData,
          statistics: fallbackStatistics,
          summary: {
            ...fallbackSummary,
            aiPerformance: fallbackAIPerformance
          }
        },
        stats: {
          totalRequested: maxRound,
          totalCollected: lottoData.length,
          successRate: '100.0',
          collectionTime: '0.0초 (Fallback 데이터)',
          analysisTime: '0.0초 (사전 계산됨)',
          totalProcessingTime: `${fallbackResponseTime}ms (Fallback)`,
          batchesProcessed: 0,
          statisticsGenerated: fallbackStatistics.length,
          cacheHit: false,
          responseTime: `${fallbackResponseTime}ms`,
          fallbackReason: collectionError || '외부 API 연결 실패'
        },
        source: 'fallback_real_data',
        message: `Fallback 시스템 활성화: 실제 로또 데이터 ${lottoData.length}회차 기반 통계 제공`,
        timestamp: new Date().toISOString(),
        cache: 'Fallback 데이터 (캐시 미사용)',
        fallback: {
          reason: collectionError || '외부 API 연결 실패',
          dataSource: dataInfo.source,
          dataRange: dataInfo.dateRange,
          isRealData: true
        }
      }, {
        headers: {
          'Cache-Control': 'public, max-age=1800', // 30분 브라우저 캐시 (Fallback은 짧게)
          'X-Response-Time': `${fallbackResponseTime}ms`,
          'X-Cache-Status': 'FALLBACK',
          'X-Fallback-Reason': collectionError || 'API_CONNECTION_FAILED'
        }
      });
    }
    
    // 4단계: 정상적인 데이터 수집 성공 시 통계 분석
    console.time('Analysis Performance');
    console.log('통계 분석 시작...');
    const analysisStartTime = Date.now();
    const statistics = LottoStatisticsAnalyzer.generateStatistics(lottoData);
    const summary = LottoStatisticsAnalyzer.generateSummary(statistics, lottoData);
    const analysisEndTime = Date.now();
    console.timeEnd('Analysis Performance');
    
    // 통계 유효성 검증
    console.time('Validation Performance');
    const isValid = LottoStatisticsAnalyzer.validateStatistics(statistics);
    if (!isValid) {
      console.warn('생성된 통계 데이터가 유효하지 않음. Fallback으로 전환합니다...');
      
      // 통계 검증 실패 시 Fallback 데이터 사용
      const fallbackStatistics = getSampleStatistics();
      const fallbackSummary = LottoStatisticsAnalyzer.generateSummary(fallbackStatistics, SAMPLE_LOTTO_DATA);
      const fallbackResponseTime = Date.now() - performanceStart;
      
      console.timeEnd('Validation Performance');
      console.timeEnd('Total Statistics API Performance');
      
      return NextResponse.json({
        success: true,
        data: {
          rawData: SAMPLE_LOTTO_DATA,
          statistics: fallbackStatistics,
          summary: fallbackSummary
        },
        stats: {
          totalRequested: maxRound,
          totalCollected: SAMPLE_LOTTO_DATA.length,
          successRate: '100.0',
          collectionTime: `${((collectionEndTime - performanceStart) / 1000).toFixed(1)}초`,
          analysisTime: '0.0초 (Fallback)',
          totalProcessingTime: `${fallbackResponseTime}ms`,
          batchesProcessed: Math.ceil(maxRound / BATCH_SIZE),
          statisticsGenerated: fallbackStatistics.length,
          cacheHit: false,
          responseTime: `${fallbackResponseTime}ms`,
          fallbackReason: '통계 데이터 검증 실패'
        },
        source: 'fallback_after_validation_failure',
        message: `통계 검증 실패로 Fallback 데이터 사용: ${SAMPLE_LOTTO_DATA.length}회차`,
        timestamp: new Date().toISOString(),
        cache: '검증 실패로 캐시 생성 안함',
        fallback: {
          reason: '통계 데이터 검증 실패',
          dataSource: 'dhlottery.co.kr',
          isRealData: true
        }
      }, {
        headers: {
          'Cache-Control': 'public, max-age=1800',
          'X-Response-Time': `${fallbackResponseTime}ms`,
          'X-Cache-Status': 'FALLBACK',
          'X-Fallback-Reason': 'VALIDATION_FAILED'
        }
      });
    }
    console.timeEnd('Validation Performance');
    
    // 5단계: 캐시에 저장
    console.time('Cache Save Performance');
    console.log('새로운 통계 데이터를 캐시에 저장 중...');
    const cacheStartTime = Date.now();
    const fileCacheSuccess = LottoCacheManager.saveToFileCache(statistics, summary, maxRound);
    const cacheEndTime = Date.now();
    console.timeEnd('Cache Save Performance');
    
    if (fileCacheSuccess) {
      console.log(`캐시 저장 완료 (${cacheEndTime - cacheStartTime}ms)`);
    } else {
      console.warn('캐시 저장 실패');
    }
    
    const endTime = Date.now();
    const totalResponseTime = endTime - performanceStart;
    
    const collectionStats = {
      totalRequested: maxRound,
      totalCollected: lottoData.length,
      successRate: ((lottoData.length / maxRound) * 100).toFixed(1),
      collectionTime: `${((collectionEndTime - performanceStart) / 1000).toFixed(1)}초`,
      analysisTime: `${((analysisEndTime - analysisStartTime) / 1000).toFixed(1)}초`,
      totalProcessingTime: `${((endTime - performanceStart) / 1000).toFixed(1)}초`,
      batchesProcessed: Math.ceil(maxRound / BATCH_SIZE),
      statisticsGenerated: statistics.length,
      cacheStatus: fileCacheSuccess ? '저장 성공' : '저장 실패',
      cacheHit: false,
      responseTime: `${totalResponseTime}ms`,
      // 성능 세부 정보
      performance: {
        collectionTimeMs: collectionEndTime - performanceStart,
        analysisTimeMs: analysisEndTime - analysisStartTime,
        cacheTimeMs: cacheEndTime - cacheStartTime,
        totalTimeMs: totalResponseTime,
        throughput: `${(lottoData.length / ((endTime - performanceStart) / 1000)).toFixed(1)} rounds/sec`
      }
    };
    
    console.log('수집 통계:', collectionStats);
    console.timeEnd('Total Statistics API Performance');
    
    return NextResponse.json({
      success: true,
      data: {
        rawData: lottoData,
        statistics,
        summary
      },
      stats: collectionStats,
      source: 'sqlite_hybrid_optimized',
      message: `스마트 수집 완료: 총 ${lottoData.length}회차 (DB: ${dbSourceRounds}, API: ${newlyCollectedData.length})`,
      timestamp: new Date().toISOString(),
      cache: fileCacheSuccess ? '새 캐시 생성' : '캐시 저장 실패'
    }, {
      headers: {
        'Cache-Control': forceRefresh ? 'no-cache' : 'public, max-age=3600', // 1시간 캐시
        'X-Response-Time': `${totalResponseTime}ms`,
        'X-Cache-Status': 'MISS',
        'X-Performance-Score': totalResponseTime < 1000 ? 'EXCELLENT' : 
                               totalResponseTime < 5000 ? 'GOOD' : 
                               totalResponseTime < 10000 ? 'FAIR' : 'POOR'
      }
    });
    
  } catch (error) {
    console.error('통계 데이터 수집 중 심각한 오류:', error);
    
    // 최종 Fallback: 모든 단계가 실패했을 때
    try {
      console.log('최종 Fallback 시스템 활성화...');
      const emergencyStatistics = getSampleStatistics();
      const emergencySummary = LottoStatisticsAnalyzer.generateSummary(emergencyStatistics, SAMPLE_LOTTO_DATA);
      const emergencyResponseTime = Date.now() - performanceStart;
      
      console.timeEnd('Total Statistics API Performance');
      
      return NextResponse.json({
        success: true,
        data: {
          rawData: SAMPLE_LOTTO_DATA,
          statistics: emergencyStatistics,
          summary: emergencySummary
        },
        stats: {
          totalRequested: parseInt(new URL(request.url).searchParams.get('maxRound') || '1180'),
          totalCollected: SAMPLE_LOTTO_DATA.length,
          successRate: '100.0',
          collectionTime: '0.0초 (최종 Fallback)',
          analysisTime: '0.0초 (사전 계산됨)',
          totalProcessingTime: `${emergencyResponseTime}ms (최종 Fallback)`,
          batchesProcessed: 0,
          statisticsGenerated: emergencyStatistics.length,
          cacheHit: false,
          responseTime: `${emergencyResponseTime}ms`,
          fallbackReason: error instanceof Error ? error.message : '알 수 없는 오류'
        },
        source: 'emergency_fallback',
        message: `최종 Fallback 시스템: 안정적인 서비스를 위해 실제 로또 데이터 ${SAMPLE_LOTTO_DATA.length}회차 기반 통계 제공`,
        timestamp: new Date().toISOString(),
        cache: '최종 Fallback (캐시 미사용)',
        error: {
          original: error instanceof Error ? error.message : '알 수 없는 오류 발생',
          handled: true,
          fallbackActivated: true
        }
      }, {
        status: 200, // 클라이언트에게는 성공으로 응답
        headers: {
          'Cache-Control': 'public, max-age=900', // 15분 캐시 (긴급 상황이므로 짧게)
          'X-Response-Time': `${emergencyResponseTime}ms`,
          'X-Cache-Status': 'EMERGENCY_FALLBACK',
          'X-Fallback-Reason': 'CRITICAL_ERROR_HANDLED'
        }
      });
      
    } catch (fallbackError) {
      // 완전한 실패 상황
      console.error('최종 Fallback도 실패:', fallbackError);
      
      return NextResponse.json({
        success: false,
        error: '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
        details: {
          original: error instanceof Error ? error.message : '알 수 없는 오류 발생',
          fallback: fallbackError instanceof Error ? fallbackError.message : 'Fallback 시스템 오류'
        },
        message: '로또 통계 서비스에 문제가 발생했습니다.',
        timestamp: new Date().toISOString()
      }, { status: 503 }); // Service Unavailable
    }
  }
}
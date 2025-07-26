// AI 추천 시스템 성능 테스트 API

import { NextRequest, NextResponse } from 'next/server';
import { LottoCacheManager } from '@/lib/cacheManager';
import { NumberGenerator } from '@/lib/numberGenerator';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';

interface PerformanceTestResult {
  testName: string;
  duration: number;
  success: boolean;
  details: any;
  memoryUsage?: NodeJS.MemoryUsage;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('test') || 'all';
  const iterations = parseInt(searchParams.get('iterations') || '10');
  
  console.log(`성능 테스트 시작: ${testType}, 반복횟수: ${iterations}`);
  
  const results: PerformanceTestResult[] = [];
  const startTime = Date.now();
  
  try {
    // 1. 캐시 성능 테스트
    if (testType === 'all' || testType === 'cache') {
      const cacheResult = await performCacheTest(iterations);
      results.push(cacheResult);
    }
    
    // 2. 번호 생성 성능 테스트
    if (testType === 'all' || testType === 'generation') {
      const generationResult = await performGenerationTest(iterations);
      results.push(generationResult);
    }
    
    // 3. 메모리 사용량 테스트
    if (testType === 'all' || testType === 'memory') {
      const memoryResult = await performMemoryTest();
      results.push(memoryResult);
    }
    
    // 4. 통계 분석 성능 테스트
    if (testType === 'all' || testType === 'analysis') {
      const analysisResult = await performAnalysisTest(iterations);
      results.push(analysisResult);
    }
    
    // 5. 에러 시나리오 테스트
    if (testType === 'all' || testType === 'error') {
      const errorResult = await performErrorTest();
      results.push(errorResult);
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 성능 점수 계산
    const performanceScore = calculatePerformanceScore(results);
    
    return NextResponse.json({
      success: true,
      data: {
        testType,
        iterations,
        totalDuration: `${totalDuration}ms`,
        performanceScore,
        results,
        summary: generateTestSummary(results),
        recommendations: generateRecommendations(results)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('성능 테스트 실행 중 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '성능 테스트 실행 실패',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// 캐시 성능 테스트
async function performCacheTest(iterations: number): Promise<PerformanceTestResult> {
  const startTime = Date.now();
  let successCount = 0;
  const durations: number[] = [];
  
  try {
    for (let i = 0; i < iterations; i++) {
      const testStart = Date.now();
      
      // 캐시 데이터 로드 테스트
      const cacheData = LottoCacheManager.loadFromFileCache();
      
      const testEnd = Date.now();
      const duration = testEnd - testStart;
      durations.push(duration);
      
      if (cacheData) {
        successCount++;
      }
    }
    
    const endTime = Date.now();
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    return {
      testName: 'Cache Performance Test',
      duration: endTime - startTime,
      success: successCount > 0,
      details: {
        totalIterations: iterations,
        successfulLoads: successCount,
        successRate: `${((successCount / iterations) * 100).toFixed(1)}%`,
        averageLoadTime: `${avgDuration.toFixed(1)}ms`,
        minLoadTime: `${minDuration}ms`,
        maxLoadTime: `${maxDuration}ms`,
        cacheMetadata: LottoCacheManager.getCacheMetadata()
      },
      memoryUsage: process.memoryUsage()
    };
    
  } catch (error) {
    return {
      testName: 'Cache Performance Test',
      duration: Date.now() - startTime,
      success: false,
      details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
    };
  }
}

// 번호 생성 성능 테스트
async function performGenerationTest(iterations: number): Promise<PerformanceTestResult> {
  const startTime = Date.now();
  let successCount = 0;
  const durations: number[] = [];
  const generatedNumbers: number[][] = [];
  
  try {
    // 통계 데이터 로드
    const cachedData = LottoCacheManager.loadFromFileCache();
    const statistics = cachedData?.data || null;
    
    for (let i = 0; i < iterations; i++) {
      const testStart = Date.now();
      
      // AI 번호 생성 테스트
      const numbers = NumberGenerator.generateAINumbers(statistics || undefined);
      
      const testEnd = Date.now();
      const duration = testEnd - testStart;
      durations.push(duration);
      
      // 번호 유효성 검증
      if (numbers.length === 6 && 
          numbers.every(n => n >= 1 && n <= 45) && 
          new Set(numbers).size === 6) {
        successCount++;
        generatedNumbers.push(numbers);
      }
    }
    
    const endTime = Date.now();
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    
    // 번호 다양성 분석
    const uniqueNumbers = new Set(generatedNumbers.flat());
    const diversity = (uniqueNumbers.size / 45) * 100;
    
    return {
      testName: 'Number Generation Performance Test',
      duration: endTime - startTime,
      success: successCount === iterations,
      details: {
        totalIterations: iterations,
        successfulGenerations: successCount,
        successRate: `${((successCount / iterations) * 100).toFixed(1)}%`,
        averageGenerationTime: `${avgDuration.toFixed(2)}ms`,
        minGenerationTime: `${Math.min(...durations)}ms`,
        maxGenerationTime: `${Math.max(...durations)}ms`,
        numberDiversity: `${diversity.toFixed(1)}%`,
        statisticsUsed: statistics !== null,
        sampleNumbers: generatedNumbers.slice(0, 3)
      },
      memoryUsage: process.memoryUsage()
    };
    
  } catch (error) {
    return {
      testName: 'Number Generation Performance Test',
      duration: Date.now() - startTime,
      success: false,
      details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
    };
  }
}

// 메모리 사용량 테스트
async function performMemoryTest(): Promise<PerformanceTestResult> {
  const startTime = Date.now();
  
  try {
    const beforeMemory = process.memoryUsage();
    
    // 대용량 데이터 처리 시뮬레이션
    const cachedData = LottoCacheManager.loadFromFileCache();
    
    // 가비지 컬렉션 강제 실행 (가능한 경우)
    if (global.gc) {
      global.gc();
    }
    
    const afterMemory = process.memoryUsage();
    
    const memoryDelta = {
      rss: afterMemory.rss - beforeMemory.rss,
      heapUsed: afterMemory.heapUsed - beforeMemory.heapUsed,
      heapTotal: afterMemory.heapTotal - beforeMemory.heapTotal,
      external: afterMemory.external - beforeMemory.external
    };
    
    return {
      testName: 'Memory Usage Test',
      duration: Date.now() - startTime,
      success: true,
      details: {
        beforeMemory: {
          rss: `${(beforeMemory.rss / 1024 / 1024).toFixed(1)}MB`,
          heapUsed: `${(beforeMemory.heapUsed / 1024 / 1024).toFixed(1)}MB`,
          heapTotal: `${(beforeMemory.heapTotal / 1024 / 1024).toFixed(1)}MB`
        },
        afterMemory: {
          rss: `${(afterMemory.rss / 1024 / 1024).toFixed(1)}MB`,
          heapUsed: `${(afterMemory.heapUsed / 1024 / 1024).toFixed(1)}MB`,
          heapTotal: `${(afterMemory.heapTotal / 1024 / 1024).toFixed(1)}MB`
        },
        memoryDelta: {
          rss: `${(memoryDelta.rss / 1024 / 1024).toFixed(1)}MB`,
          heapUsed: `${(memoryDelta.heapUsed / 1024 / 1024).toFixed(1)}MB`,
          heapTotal: `${(memoryDelta.heapTotal / 1024 / 1024).toFixed(1)}MB`
        },
        cacheSize: cachedData ? `${JSON.stringify(cachedData).length / 1024} KB` : 'N/A'
      },
      memoryUsage: afterMemory
    };
    
  } catch (error) {
    return {
      testName: 'Memory Usage Test',
      duration: Date.now() - startTime,
      success: false,
      details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
    };
  }
}

// 통계 분석 성능 테스트
async function performAnalysisTest(iterations: number): Promise<PerformanceTestResult> {
  const startTime = Date.now();
  let successCount = 0;
  const durations: number[] = [];
  
  try {
    // 가상의 로또 데이터 생성
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      round: i + 1,
      drawDate: new Date().toISOString().split('T')[0],
      numbers: Array.from({ length: 6 }, () => Math.floor(Math.random() * 45) + 1).sort((a, b) => a - b),
      bonusNumber: Math.floor(Math.random() * 45) + 1,
      prizeMoney: { first: 0, firstWinners: 0, second: 0, secondWinners: 0 }
    }));
    
    for (let i = 0; i < Math.min(iterations, 5); i++) { // 최대 5번만 실행 (무거운 작업)
      const testStart = Date.now();
      
      const statistics = LottoStatisticsAnalyzer.generateStatistics(mockData);
      const isValid = LottoStatisticsAnalyzer.validateStatistics(statistics);
      
      const testEnd = Date.now();
      durations.push(testEnd - testStart);
      
      if (isValid && statistics.length === 45) {
        successCount++;
      }
    }
    
    const endTime = Date.now();
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    
    return {
      testName: 'Statistics Analysis Performance Test',
      duration: endTime - startTime,
      success: successCount > 0,
      details: {
        totalIterations: Math.min(iterations, 5),
        successfulAnalyses: successCount,
        successRate: `${((successCount / Math.min(iterations, 5)) * 100).toFixed(1)}%`,
        averageAnalysisTime: `${avgDuration.toFixed(1)}ms`,
        dataSize: `${mockData.length} rounds`,
        throughput: `${(mockData.length / (avgDuration / 1000)).toFixed(1)} rounds/sec`
      },
      memoryUsage: process.memoryUsage()
    };
    
  } catch (error) {
    return {
      testName: 'Statistics Analysis Performance Test',
      duration: Date.now() - startTime,
      success: false,
      details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
    };
  }
}

// 에러 시나리오 테스트
async function performErrorTest(): Promise<PerformanceTestResult> {
  const startTime = Date.now();
  const testResults: any[] = [];
  
  try {
    // 1. 잘못된 통계 데이터로 번호 생성 테스트
    try {
      const invalidStats = [{ number: 1, frequency: -1, lastAppeared: 999, hotColdScore: 200, consecutiveCount: -5 }] as any;
      const numbers = NumberGenerator.generateAINumbers(invalidStats);
      testResults.push({ test: 'invalid_statistics', success: true, result: 'fallback_worked', numbers });
    } catch (error) {
      testResults.push({ test: 'invalid_statistics', success: false, error: (error as Error).message });
    }
    
    // 2. 빈 통계 데이터로 번호 생성 테스트
    try {
      const numbers = NumberGenerator.generateAINumbers([]);
      testResults.push({ test: 'empty_statistics', success: true, result: 'fallback_worked', numbers });
    } catch (error) {
      testResults.push({ test: 'empty_statistics', success: false, error: (error as Error).message });
    }
    
    // 3. null 통계 데이터로 번호 생성 테스트
    try {
      const numbers = NumberGenerator.generateAINumbers(null as any);
      testResults.push({ test: 'null_statistics', success: true, result: 'fallback_worked', numbers });
    } catch (error) {
      testResults.push({ test: 'null_statistics', success: false, error: (error as Error).message });
    }
    
    // 4. 캐시 무결성 테스트
    try {
      const metadata = LottoCacheManager.getCacheMetadata();
      const isValid = LottoCacheManager.isCacheValid(100);
      testResults.push({ test: 'cache_integrity', success: true, metadata, isValid });
    } catch (error) {
      testResults.push({ test: 'cache_integrity', success: false, error: (error as Error).message });
    }
    
    const successCount = testResults.filter(r => r.success).length;
    
    return {
      testName: 'Error Scenario Test',
      duration: Date.now() - startTime,
      success: successCount === testResults.length,
      details: {
        totalTests: testResults.length,
        passedTests: successCount,
        passRate: `${((successCount / testResults.length) * 100).toFixed(1)}%`,
        testResults
      },
      memoryUsage: process.memoryUsage()
    };
    
  } catch (error) {
    return {
      testName: 'Error Scenario Test',
      duration: Date.now() - startTime,
      success: false,
      details: { error: error instanceof Error ? error.message : '알 수 없는 오류' }
    };
  }
}

// 성능 점수 계산
function calculatePerformanceScore(results: PerformanceTestResult[]): string {
  const weights = {
    'Cache Performance Test': 0.3,
    'Number Generation Performance Test': 0.25,
    'Memory Usage Test': 0.2,
    'Statistics Analysis Performance Test': 0.15,
    'Error Scenario Test': 0.1
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  results.forEach(result => {
    const weight = weights[result.testName as keyof typeof weights] || 0.1;
    const score = result.success ? 100 : 0;
    
    totalScore += score * weight;
    totalWeight += weight;
  });
  
  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  if (finalScore >= 95) return 'EXCELLENT';
  if (finalScore >= 85) return 'GOOD';
  if (finalScore >= 70) return 'FAIR';
  return 'POOR';
}

// 테스트 요약 생성
function generateTestSummary(results: PerformanceTestResult[]): any {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  return {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    passRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
    totalDuration: `${totalDuration}ms`,
    averageDuration: `${(totalDuration / totalTests).toFixed(1)}ms`
  };
}

// 권장사항 생성
function generateRecommendations(results: PerformanceTestResult[]): string[] {
  const recommendations: string[] = [];
  
  results.forEach(result => {
    if (!result.success) {
      recommendations.push(`${result.testName} 실패: 안정성 개선 필요`);
    }
    
    if (result.duration > 1000) {
      recommendations.push(`${result.testName} 성능 최적화 권장 (${result.duration}ms)`);
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('모든 테스트 통과: 시스템이 안정적으로 작동 중');
  }
  
  return recommendations;
}
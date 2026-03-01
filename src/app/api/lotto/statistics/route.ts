import { NextRequest, NextResponse } from 'next/server';
import type { LottoResult, NumberStatistics } from '@/types/lotto';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import { getAllLottoData, registerCacheInvalidationCallback } from '@/lib/dataFetcher';

// 인메모리 캐시
let cachedStats: {
  statistics: NumberStatistics[];
  summary: ReturnType<typeof LottoStatisticsAnalyzer.generateSummary>;
  maxRound: number;
  timestamp: number;
} | null = null;

const CACHE_TTL = 60 * 60 * 1000; // 1시간

// dataFetcher 캐시 무효화 시 통계 캐시도 같이 날림
registerCacheInvalidationCallback(() => {
  cachedStats = null;
});

export async function GET(request: NextRequest) {
  const performanceStart = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const maxRound = parseInt(searchParams.get('maxRound') || '9999');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const windowParam = searchParams.get('window');
    const compareParam = searchParams.get('compare') === 'true';

    // 최신 데이터 가져오기 (정적 + 동적)
    const allLottoData = await getAllLottoData();
    const lottoData = allLottoData.filter((d) => d.round <= maxRound);

    if (lottoData.length === 0) {
      return NextResponse.json({
        success: false,
        error: '통계 생성을 위한 데이터가 없습니다.',
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    // ===== Windowed Statistics Mode =====
    if (windowParam) {
      const windowSize = parseInt(windowParam);
      if (isNaN(windowSize) || windowSize <= 0) {
        return NextResponse.json({
          success: false,
          error: 'window 파라미터는 양의 정수여야 합니다.',
          timestamp: new Date().toISOString(),
        }, { status: 400 });
      }

      const windowedStats = LottoStatisticsAnalyzer.generateTimeWindowedStats(lottoData, windowSize);
      const responseTime = Date.now() - performanceStart;

      const responseData: any = {
        success: true,
        data: {
          statistics: windowedStats,
          windowSize,
          totalRounds: lottoData.length,
        },
        stats: {
          totalCollected: lottoData.length,
          windowSize,
          responseTime: `${responseTime}ms`,
        },
        source: 'windowed_analysis',
        message: `최근 ${windowSize}회차 윈도우 통계 분석 완료`,
        timestamp: new Date().toISOString(),
      };

      // If compare=true, also include window comparison data
      if (compareParam) {
        const comparison = LottoStatisticsAnalyzer.compareWindows(lottoData, windowSize, windowSize);
        const weeklyChanges = LottoStatisticsAnalyzer.getWeeklyChanges(lottoData);
        responseData.data.comparison = comparison;
        responseData.data.weeklyChanges = weeklyChanges;
      }

      return NextResponse.json(responseData, {
        headers: {
          'Cache-Control': 'public, max-age=1800',
          'X-Cache-Status': 'MISS',
        },
      });
    }

    // ===== Compare-Only Mode =====
    if (compareParam && !windowParam) {
      const comparison = LottoStatisticsAnalyzer.compareWindows(lottoData, 10, 10);
      const weeklyChanges = LottoStatisticsAnalyzer.getWeeklyChanges(lottoData);
      const responseTime = Date.now() - performanceStart;

      return NextResponse.json({
        success: true,
        data: {
          comparison,
          weeklyChanges,
          totalRounds: lottoData.length,
        },
        stats: {
          totalCollected: lottoData.length,
          responseTime: `${responseTime}ms`,
        },
        source: 'comparison_analysis',
        message: '윈도우 비교 분석 완료',
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, max-age=1800',
          'X-Cache-Status': 'MISS',
        },
      });
    }

    // ===== Default: All-time Statistics =====

    // 인메모리 캐시 확인
    if (!forceRefresh && cachedStats && Date.now() - cachedStats.timestamp < CACHE_TTL) {
      const responseTime = Date.now() - performanceStart;
      return NextResponse.json({
        success: true,
        data: {
          rawData: allLottoData,
          statistics: cachedStats.statistics,
          summary: cachedStats.summary,
          maxRound: cachedStats.maxRound,
        },
        stats: {
          totalRequested: maxRound,
          totalCollected: allLottoData.length,
          successRate: '100.0',
          responseTime: `${responseTime}ms`,
          cacheHit: true,
        },
        source: 'memory_cache',
        message: `캐시된 ${allLottoData.length}회차 통계 데이터`,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'X-Cache-Status': 'HIT',
        },
      });
    }

    // 통계 계산
    const statistics = LottoStatisticsAnalyzer.generateStatistics(lottoData);
    const summary = LottoStatisticsAnalyzer.generateSummary(statistics, lottoData);

    // 캐시 저장
    cachedStats = {
      statistics,
      summary,
      maxRound: lottoData[lottoData.length - 1].round,
      timestamp: Date.now(),
    };

    const responseTime = Date.now() - performanceStart;

    return NextResponse.json({
      success: true,
      data: {
        rawData: lottoData,
        statistics,
        summary,
        maxRound: lottoData[lottoData.length - 1].round,
      },
      stats: {
        totalRequested: maxRound,
        totalCollected: lottoData.length,
        successRate: '100.0',
        responseTime: `${responseTime}ms`,
        cacheHit: false,
      },
      source: 'static_data_analysis',
      message: `${lottoData.length}회차 데이터 기반 통계 분석 완료`,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'X-Cache-Status': 'MISS',
      },
    });

  } catch (error) {
    console.error('통계 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '통계 데이터를 생성할 수 없습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

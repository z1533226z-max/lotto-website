// 캐시 관리 API 엔드포인트

import { NextRequest, NextResponse } from 'next/server';
import { LottoCacheManager } from '@/lib/cacheManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    
    switch (action) {
      case 'status':
        // 캐시 상태 조회
        const metadata = LottoCacheManager.getCacheMetadata();
        const report = LottoCacheManager.generateCacheReport();
        
        return NextResponse.json({
          success: true,
          data: {
            metadata,
            report: report.split('\n')
          },
          message: '캐시 상태 조회 완료',
          timestamp: new Date().toISOString()
        });
        
      case 'validate':
        // 캐시 유효성 검증
        const minRounds = parseInt(searchParams.get('minRounds') || '100');
        const isValid = LottoCacheManager.isCacheValid(minRounds);
        const validationMetadata = LottoCacheManager.getCacheMetadata();
        
        return NextResponse.json({
          success: true,
          data: {
            isValid,
            metadata: validationMetadata,
            minRounds
          },
          message: `캐시 유효성 검증 완료: ${isValid ? '유효' : '무효'}`,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: `지원하지 않는 action: ${action}`,
          supportedActions: ['status', 'validate'],
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('캐시 관리 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '캐시 관리 중 알 수 없는 오류가 발생했습니다.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target') || 'all';
    
    let success = false;
    let message = '';
    
    switch (target) {
      case 'file':
        success = LottoCacheManager.clearFileCache();
        message = success ? '파일 캐시 삭제 완료' : '파일 캐시 삭제 실패';
        break;
        
      case 'local':
        success = LottoCacheManager.clearLocalStorage();
        message = success ? '로컬스토리지 캐시 삭제 완료' : '로컬스토리지 캐시 삭제 실패';
        break;
        
      case 'all':
      default:
        success = LottoCacheManager.clearAllCaches();
        message = success ? '모든 캐시 삭제 완료' : '캐시 삭제 중 일부 실패';
        break;
    }
    
    return NextResponse.json({
      success,
      data: {
        target,
        cleared: success
      },
      message,
      timestamp: new Date().toISOString()
    }, { status: success ? 200 : 500 });
    
  } catch (error) {
    console.error('캐시 삭제 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '캐시 삭제 중 알 수 없는 오류가 발생했습니다.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
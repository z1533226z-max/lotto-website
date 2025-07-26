import { NextRequest, NextResponse } from 'next/server';
import type { LottoResult } from '@/types/lotto';

// 동행복권 API에서 로또 데이터를 가져오는 함수
async function fetchLottoData(round: number): Promise<LottoResult> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
      },
      next: { revalidate: 86400 } // 24시간 캐시 (과거 데이터는 변하지 않음)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: 동행복권 서버 연결 실패`);
    }
    
    const data = await response.json();
    
    if (data.returnValue === 'fail') {
      throw new Error(`${round}회차는 존재하지 않거나 아직 추첨되지 않았습니다.`);
    }
    
    return convertToLottoResult(data);
    
  } catch (error) {
    console.error(`${round}회차 동행복권 API 호출 실패:`, error);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`${round}회차 데이터를 가져올 수 없습니다.`);
  }
}

// 동행복권 API 응답을 우리 타입으로 변환
function convertToLottoResult(data: any): LottoResult {
  // 필수 데이터 검증
  if (!data.drwNo || !data.drwNoDate || !data.drwtNo1) {
    throw new Error('로또 데이터 형식이 올바르지 않습니다.');
  }

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
    ].sort((a, b) => a - b), // 번호 정렬
    bonusNumber: data.bnusNo,
    prizeMoney: {
      first: data.firstWinamnt || 0,
      firstWinners: data.firstPrzwnerCo || 0,
      second: data.secondWinamnt || Math.floor((data.firstWinamnt || 0) * 0.2),
      secondWinners: data.secondPrzwnerCo || Math.floor((data.firstPrzwnerCo || 0) * 3)
    }
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const round = parseInt(params.id);
    
    // 회차 번호 유효성 검사
    if (isNaN(round) || round < 1) {
      return NextResponse.json({
        success: false,
        error: '올바른 회차 번호를 입력해주세요 (1 이상의 숫자)'
      }, { status: 400 });
    }
    
    // 너무 큰 회차 번호 체크 (현재 추정 최대 회차 + 여유분)
    const currentYear = new Date().getFullYear();
    const maxPossibleRound = (currentYear - 2004) * 52 + 100; // 년도당 52주 + 여유분
    
    if (round > maxPossibleRound) {
      return NextResponse.json({
        success: false,
        error: `${round}회차는 아직 추첨되지 않았습니다.`
      }, { status: 400 });
    }
    
    console.log(`${round}회차 데이터 요청 시작...`);
    
    // 실제 동행복권 API에서 데이터 가져오기
    const result = await fetchLottoData(round);
    
    console.log(`${round}회차 데이터 성공적으로 로드`);
    
    return NextResponse.json({
      success: true,
      data: result,
      source: 'official_api',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`회차별 로또 데이터 조회 중 오류 (회차: ${params.id}):`, error);
    
    // 실제 API 연결 실패 시 에러 반환 (더미 데이터 사용 안 함)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '로또 데이터를 가져올 수 없습니다.',
      message: '로또 당첨번호는 반드시 공식 데이터여야 하므로 연결 실패 시 표시하지 않습니다.',
      timestamp: new Date().toISOString()
    }, { status: 503 }); // Service Unavailable
  }
}
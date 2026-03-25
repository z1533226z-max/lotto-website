// 주간 로또 분석 자동 생성기
import type { LottoResult } from '@/types/lotto';
import { LottoStatisticsAnalyzer } from './statisticsAnalyzer';

export interface WeeklyAnalysis {
  round: number;
  drawDate: string;
  winningNumbers: number[];
  bonusNumber: number;
  firstPrize: string;
  firstWinners: number;
  hotNumbers: number[];       // 최근 10회 가장 많이 나온 번호
  coldNumbers: number[];      // 최근 10회 가장 적게 나온 번호
  oddEvenRatio: string;       // 홀짝비
  highLowRatio: string;       // 고저비
  sumRange: string;           // 총합 범위 분석
  consecutivePattern: string; // 연속번호 패턴
  sectionDistribution: string; // 구간별 분포
  weeklyTrend: string;        // 주간 트렌드 요약
  seoTitle: string;
  seoDescription: string;
  analysisText: string;        // 전체 분석 텍스트 (SEO용)
  generatedAt: string;
}

export function generateWeeklyAnalysisForRound(allData: LottoResult[], targetRound: number): WeeklyAnalysis | null {
  const targetIndex = allData.findIndex(d => d.round === targetRound);
  if (targetIndex < 10) return null;
  const slicedData = allData.slice(0, targetIndex + 1);
  return generateWeeklyAnalysis(slicedData);
}

export function generateWeeklyAnalysis(allData: LottoResult[]): WeeklyAnalysis | null {
  if (allData.length < 10) return null;

  const latest = allData[allData.length - 1];
  const recent10 = allData.slice(-10);
  const recent20 = allData.slice(-20);

  // 핫넘버 (최근 10회 출현 빈도 상위 5개)
  const freq10: Record<number, number> = {};
  for (let n = 1; n <= 45; n++) freq10[n] = 0;
  for (const r of recent10) {
    for (const n of r.numbers) freq10[n]++;
    freq10[r.bonusNumber]++;
  }
  const sorted10 = Object.entries(freq10)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => Number(n));
  const hotNumbers = sorted10.slice(0, 5);
  const coldNumbers = sorted10.slice(-5).reverse();

  // 홀짝비
  const odds = latest.numbers.filter(n => n % 2 === 1).length;
  const evens = 6 - odds;
  const oddEvenRatio = `${odds}:${evens}`;

  // 고저비 (1~22 저, 23~45 고)
  const lows = latest.numbers.filter(n => n <= 22).length;
  const highs = 6 - lows;
  const highLowRatio = `저${lows}:고${highs}`;

  // 총합
  const sum = latest.numbers.reduce((a, b) => a + b, 0);
  const avgSum = Math.round(recent20.reduce((a, r) => a + r.numbers.reduce((x, y) => x + y, 0), 0) / recent20.length);
  const sumRange = `${sum} (최근 20회 평균: ${avgSum})`;

  // 연속번호
  const sortedNums = [...latest.numbers].sort((a, b) => a - b);
  const consecutivePairs: string[] = [];
  for (let i = 0; i < sortedNums.length - 1; i++) {
    if (sortedNums[i + 1] - sortedNums[i] === 1) {
      consecutivePairs.push(`${sortedNums[i]}-${sortedNums[i + 1]}`);
    }
  }
  const consecutivePattern = consecutivePairs.length > 0
    ? `연속번호 ${consecutivePairs.length}쌍 (${consecutivePairs.join(', ')})`
    : '연속번호 없음';

  // 구간별 분포
  const sections = [0, 0, 0, 0, 0]; // 1-9, 10-19, 20-29, 30-39, 40-45
  for (const n of latest.numbers) {
    if (n <= 9) sections[0]++;
    else if (n <= 19) sections[1]++;
    else if (n <= 29) sections[2]++;
    else if (n <= 39) sections[3]++;
    else sections[4]++;
  }
  const sectionDistribution = `1~9(${sections[0]}) | 10~19(${sections[1]}) | 20~29(${sections[2]}) | 30~39(${sections[3]}) | 40~45(${sections[4]})`;

  // 주간 트렌드
  const prev = allData[allData.length - 2];
  const repeatedFromPrev = latest.numbers.filter(n => prev.numbers.includes(n));
  const weeklyTrend = repeatedFromPrev.length > 0
    ? `전회차 동일번호 ${repeatedFromPrev.length}개 (${repeatedFromPrev.join(', ')})`
    : '전회차 동일번호 없음 (완전 새로운 조합)';

  // 1등 당첨금 포맷
  const firstPrize = latest.prizeMoney.first
    ? `${Math.round(latest.prizeMoney.first / 100000000).toLocaleString()}억원`
    : '미확정';

  // SEO 텍스트 생성
  const numbersStr = sortedNums.join(', ');
  const seoTitle = `${latest.round}회 로또 당첨번호 분석 - ${numbersStr} + ${latest.bonusNumber}`;
  const seoDescription = `${latest.round}회 로또 당첨번호 ${numbersStr} + 보너스 ${latest.bonusNumber} 완전 분석. 핫넘버 ${hotNumbers.slice(0, 3).join(',')}번, 콜드넘버 ${coldNumbers.slice(0, 3).join(',')}번. 홀짝비 ${oddEvenRatio}, ${consecutivePattern}.`;

  // 전체 분석 텍스트
  const analysisText = [
    `## ${latest.round}회 로또 당첨번호 심층 분석`,
    ``,
    `### 당첨 결과`,
    `- **당첨번호**: ${numbersStr}`,
    `- **보너스번호**: ${latest.bonusNumber}`,
    `- **추첨일**: ${latest.drawDate}`,
    `- **1등 당첨금**: ${firstPrize} (${latest.prizeMoney.firstWinners}명)`,
    ``,
    `### 번호 분석`,
    `- **홀짝비**: ${oddEvenRatio} (${odds > evens ? '홀수 우세' : odds < evens ? '짝수 우세' : '균형'})`,
    `- **고저비**: ${highLowRatio}`,
    `- **번호 총합**: ${sumRange}`,
    `- **${consecutivePattern}**`,
    `- **구간 분포**: ${sectionDistribution}`,
    ``,
    `### 최근 트렌드 (10회 기준)`,
    `- **핫넘버** (자주 출현): ${hotNumbers.join(', ')}번`,
    `- **콜드넘버** (미출현): ${coldNumbers.join(', ')}번`,
    `- **${weeklyTrend}**`,
    ``,
    `### AI 인사이트`,
    `${latest.round}회 추첨에서는 ${odds > evens ? '홀수 번호가 우세한' : odds < evens ? '짝수 번호가 우세한' : '홀짝이 균형을 이룬'} 조합이 나왔습니다. `,
    `총합 ${sum}은 최근 20회 평균 ${avgSum}과 비교하여 ${sum > avgSum ? '높은' : sum < avgSum ? '낮은' : '비슷한'} 수준입니다. `,
    `다음 회차에서는 최근 콜드넘버인 ${coldNumbers.slice(0, 3).join(', ')}번의 출현 가능성에 주목할 만합니다.`,
  ].join('\n');

  return {
    round: latest.round,
    drawDate: latest.drawDate,
    winningNumbers: sortedNums,
    bonusNumber: latest.bonusNumber,
    firstPrize,
    firstWinners: latest.prizeMoney.firstWinners,
    hotNumbers,
    coldNumbers,
    oddEvenRatio,
    highLowRatio,
    sumRange,
    consecutivePattern,
    sectionDistribution,
    weeklyTrend,
    seoTitle,
    seoDescription,
    analysisText,
    generatedAt: new Date().toISOString(),
  };
}

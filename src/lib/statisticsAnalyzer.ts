// 로또 통계 분석 엔진

import type { LottoResult, NumberStatistics, ExtendedNumberStatistics, SectionDistribution, OddEvenPattern, TrendAnalysisResult, AIPerformanceMetrics } from '@/types/lotto';
import { LOTTO_CONFIG } from './constants';

export class LottoStatisticsAnalyzer {
  
  /**
   * 전체 통계 생성 (메인 엔트리 포인트)
   */
  static generateStatistics(lottoData: LottoResult[]): NumberStatistics[] {
    console.log(`통계 분석 시작: ${lottoData.length}개 회차 데이터`);
    
    if (lottoData.length === 0) {
      console.warn('로또 데이터가 없어서 기본 통계를 반환합니다.');
      return this.getDefaultStatistics();
    }
    
    // 1~45번 모든 번호에 대한 통계 계산
    const statistics: NumberStatistics[] = [];
    
    for (let number = LOTTO_CONFIG.MIN_NUMBER; number <= LOTTO_CONFIG.MAX_NUMBER; number++) {
      const numberStats = this.calculateNumberStatistics(number, lottoData);
      statistics.push(numberStats);
    }
    
    console.log(`통계 분석 완료: ${statistics.length}개 번호 통계 생성`);
    return statistics;
  }
  
  /**
   * 특정 번호의 종합 통계 계산
   */
  private static calculateNumberStatistics(number: number, lottoData: LottoResult[]): NumberStatistics {
    return {
      number,
      frequency: this.calculateFrequency(number, lottoData),
      lastAppeared: this.calculateLastAppeared(number, lottoData),
      hotColdScore: this.calculateHotColdScore(number, lottoData),
      consecutiveCount: this.calculateConsecutiveCount(number, lottoData)
    };
  }
  
  /**
   * 출현 빈도 계산
   */
  static calculateFrequency(number: number, lottoData: LottoResult[]): number {
    let count = 0;
    
    for (const round of lottoData) {
      // 본번호 6개 + 보너스번호 확인
      if (round.numbers.includes(number) || round.bonusNumber === number) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * 마지막 출현 회차 계산
   */
  static calculateLastAppeared(number: number, lottoData: LottoResult[]): number {
    // 최신 회차부터 역순으로 검색
    const sortedData = [...lottoData].sort((a, b) => b.round - a.round);
    
    for (const round of sortedData) {
      if (round.numbers.includes(number) || round.bonusNumber === number) {
        return round.round;
      }
    }
    
    // 한 번도 나오지 않은 경우 0 반환
    return 0;
  }
  
  /**
   * 핫/콜드 점수 계산 (-100 ~ 100)
   */
  static calculateHotColdScore(number: number, lottoData: LottoResult[]): number {
    if (lottoData.length === 0) {
      console.warn('로또 데이터가 없어서 hotColdScore를 0으로 반환합니다.');
      return 0;
    }
    
    const frequency = this.calculateFrequency(number, lottoData);
    const totalRounds = lottoData.length;
    const lastAppeared = this.calculateLastAppeared(number, lottoData);
    const latestRound = Math.max(...lottoData.map(r => r.round));
    
    // 전체 평균 출현율 계산 (본번호 6 + 보너스 1 = 7개/회차)
    const averageFrequency = (totalRounds * 7) / 45;
    
    // 빈도 점수 (-50 ~ 50)
    const frequencyScore = ((frequency / averageFrequency) - 1) * 50;
    
    // 최근성 점수 (-50 ~ 50)
    let recentnessScore = 0;
    if (lastAppeared > 0) {
      const roundsSinceLastAppear = latestRound - lastAppeared;
      // 최근 10회차 이내: +점수, 30회차 이상: -점수
      recentnessScore = Math.max(-50, Math.min(50, (10 - roundsSinceLastAppear) * 2));
    } else {
      recentnessScore = -50; // 한 번도 안 나온 경우
    }
    
    const totalScore = frequencyScore + recentnessScore;
    return Math.max(-100, Math.min(100, totalScore));
  }
  
  /**
   * 최근 연속 출현 횟수 계산
   */
  static calculateConsecutiveCount(number: number, lottoData: LottoResult[]): number {
    if (lottoData.length === 0) return 0;
    
    // 최신 회차부터 역순으로 확인
    const sortedData = [...lottoData].sort((a, b) => b.round - a.round);
    let consecutiveCount = 0;
    
    for (const round of sortedData) {
      if (round.numbers.includes(number) || round.bonusNumber === number) {
        consecutiveCount++;
      } else {
        break; // 연속이 끊어지면 중단
      }
    }
    
    return consecutiveCount;
  }
  
  /**
   * 최근 N회차 출현 빈도 계산
   */
  static calculateRecentFrequency(number: number, lottoData: LottoResult[], recentRounds: number = 20): number {
    if (lottoData.length === 0) return 0;
    
    // 최신 N회차 데이터만 필터링
    const sortedData = [...lottoData]
      .sort((a, b) => b.round - a.round)
      .slice(0, recentRounds);
    
    return this.calculateFrequency(number, sortedData);
  }
  
  /**
   * 핫 번호 Top N 조회
   */
  static getHotNumbers(statistics: NumberStatistics[], count: number = 10): NumberStatistics[] {
    return [...statistics]
      .sort((a, b) => b.hotColdScore - a.hotColdScore)
      .slice(0, count);
  }
  
  /**
   * 콜드 번호 Top N 조회
   */
  static getColdNumbers(statistics: NumberStatistics[], count: number = 10): NumberStatistics[] {
    return [...statistics]
      .sort((a, b) => a.hotColdScore - b.hotColdScore)
      .slice(0, count);
  }
  
  /**
   * 출현 빈도 Top N 조회
   */
  static getMostFrequentNumbers(statistics: NumberStatistics[], count: number = 10): NumberStatistics[] {
    return [...statistics]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, count);
  }
  
  /**
   * 출현 빈도 Bottom N 조회 (가장 적게 나온 번호)
   */
  static getLeastFrequentNumbers(statistics: NumberStatistics[], count: number = 10): NumberStatistics[] {
    return [...statistics]
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, count);
  }
  
  /**
   * 최근 출현한 번호들 조회
   */
  static getRecentlyAppearedNumbers(statistics: NumberStatistics[], count: number = 10): NumberStatistics[] {
    return [...statistics]
      .sort((a, b) => b.lastAppeared - a.lastAppeared)
      .slice(0, count);
  }
  
  /**
   * 오랫동안 나오지 않은 번호들 조회
   */
  static getLongAbsentNumbers(statistics: NumberStatistics[], count: number = 10): NumberStatistics[] {
    // lastAppeared가 0인 경우(한 번도 안 나온 경우)를 가장 오래된 것으로 처리
    return [...statistics]
      .sort((a, b) => {
        if (a.lastAppeared === 0 && b.lastAppeared === 0) return a.number - b.number;
        if (a.lastAppeared === 0) return 1;
        if (b.lastAppeared === 0) return -1;
        return a.lastAppeared - b.lastAppeared;
      })
      .slice(0, count);
  }
  
  /**
   * 전체 통계 요약 정보 생성
   */
  static generateSummary(statistics: NumberStatistics[], lottoData: LottoResult[]): any {
    const totalRounds = lottoData.length;
    const totalNumbers = statistics.length;
    
    // 평균 출현 빈도
    const averageFrequency = statistics.reduce((sum, stat) => sum + stat.frequency, 0) / totalNumbers;
    
    // 가장 많이/적게 나온 번호
    const mostFrequent = this.getMostFrequentNumbers(statistics, 1)[0];
    const leastFrequent = this.getLeastFrequentNumbers(statistics, 1)[0];
    
    // 핫/콜드 번호
    const hottestNumber = this.getHotNumbers(statistics, 1)[0];
    const coldestNumber = this.getColdNumbers(statistics, 1)[0];
    
    return {
      totalRounds,
      totalNumbers,
      averageFrequency: Math.round(averageFrequency * 100) / 100,
      mostFrequent: {
        number: mostFrequent.number,
        frequency: mostFrequent.frequency
      },
      leastFrequent: {
        number: leastFrequent.number,
        frequency: leastFrequent.frequency
      },
      hottestNumber: {
        number: hottestNumber.number,
        hotColdScore: Math.round(hottestNumber.hotColdScore)
      },
      coldestNumber: {
        number: coldestNumber.number,
        hotColdScore: Math.round(coldestNumber.hotColdScore)
      }
    };
  }
  
  /**
   * 기본 통계 데이터 (데이터가 없을 때 사용)
   */
  private static getDefaultStatistics(): NumberStatistics[] {
    const statistics: NumberStatistics[] = [];
    
    for (let number = LOTTO_CONFIG.MIN_NUMBER; number <= LOTTO_CONFIG.MAX_NUMBER; number++) {
      statistics.push({
        number,
        frequency: 0,
        lastAppeared: 0,
        hotColdScore: 0,
        consecutiveCount: 0
      });
    }
    
    return statistics;
  }
  
  // =============================================
  // 시간 윈도우 기반 통계 메서드들
  // =============================================

  /**
   * 최근 N회차에 대한 윈도우 통계 생성
   */
  static generateTimeWindowedStats(data: LottoResult[], windowSize: number): NumberStatistics[] {
    if (data.length === 0) return this.getDefaultStatistics();

    const sortedData = [...data].sort((a, b) => b.round - a.round);
    const windowData = sortedData.slice(0, Math.min(windowSize, sortedData.length));

    return this.generateStatistics(windowData);
  }

  /**
   * 두 시간 윈도우를 비교하여 트렌드 변화 반환
   */
  static compareWindows(data: LottoResult[], recentSize: number, previousSize: number): {
    hotNumbers: { number: number; recentFreq: number; previousFreq: number; change: number }[];
    coldNumbers: { number: number; recentFreq: number; previousFreq: number; change: number }[];
    newlyAppeared: number[];
    disappeared: number[];
  } {
    const sortedData = [...data].sort((a, b) => b.round - a.round);
    const recentData = sortedData.slice(0, Math.min(recentSize, sortedData.length));
    const previousData = sortedData.slice(recentSize, Math.min(recentSize + previousSize, sortedData.length));

    const comparisons: { number: number; recentFreq: number; previousFreq: number; change: number }[] = [];

    for (let num = LOTTO_CONFIG.MIN_NUMBER; num <= LOTTO_CONFIG.MAX_NUMBER; num++) {
      const recentFreq = this.calculateFrequency(num, recentData);
      const previousFreq = this.calculateFrequency(num, previousData);
      // Normalize by window sizes for fair comparison
      const recentRate = recentData.length > 0 ? recentFreq / recentData.length : 0;
      const previousRate = previousData.length > 0 ? previousFreq / previousData.length : 0;
      const change = recentRate - previousRate;
      comparisons.push({ number: num, recentFreq, previousFreq, change });
    }

    // Hot numbers: sorted by highest positive change
    const hotNumbers = comparisons
      .filter(c => c.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 10);

    // Cold numbers: sorted by most negative change
    const coldNumbers = comparisons
      .filter(c => c.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 10);

    // Newly appeared: appeared in recent but NOT in previous window
    const newlyAppeared = comparisons
      .filter(c => c.recentFreq > 0 && c.previousFreq === 0)
      .map(c => c.number);

    // Disappeared: appeared in previous but NOT in recent window
    const disappeared = comparisons
      .filter(c => c.recentFreq === 0 && c.previousFreq > 0)
      .map(c => c.number);

    return { hotNumbers, coldNumbers, newlyAppeared, disappeared };
  }

  /**
   * 이번 주 변화 요약 (최신 회차 기준)
   */
  static getWeeklyChanges(data: LottoResult[]): {
    latestRound: number;
    newNumbers: number[];
    bonusNumber: number;
    longestAbsent: { number: number; rounds: number }[];
    hottestStreak: { number: number; consecutiveAppearances: number }[];
    overduePredictions: number[];
  } {
    if (data.length === 0) {
      return {
        latestRound: 0,
        newNumbers: [],
        bonusNumber: 0,
        longestAbsent: [],
        hottestStreak: [],
        overduePredictions: [],
      };
    }

    const sortedData = [...data].sort((a, b) => b.round - a.round);
    const latest = sortedData[0];
    const latestRound = latest.round;

    // Latest winning numbers and bonus
    const newNumbers = [...latest.numbers].sort((a, b) => a - b);
    const bonusNumber = latest.bonusNumber;

    // Longest absent: numbers that haven't appeared for the most rounds
    const absentInfo: { number: number; rounds: number }[] = [];
    for (let num = LOTTO_CONFIG.MIN_NUMBER; num <= LOTTO_CONFIG.MAX_NUMBER; num++) {
      const lastAppeared = this.calculateLastAppeared(num, data);
      const roundsAbsent = lastAppeared > 0 ? latestRound - lastAppeared : latestRound;
      absentInfo.push({ number: num, rounds: roundsAbsent });
    }
    const longestAbsent = absentInfo
      .sort((a, b) => b.rounds - a.rounds)
      .slice(0, 5);

    // Hottest streak: consecutive appearances from latest round backwards
    const streakInfo: { number: number; consecutiveAppearances: number }[] = [];
    for (let num = LOTTO_CONFIG.MIN_NUMBER; num <= LOTTO_CONFIG.MAX_NUMBER; num++) {
      const consecutive = this.calculateConsecutiveCount(num, data);
      if (consecutive > 0) {
        streakInfo.push({ number: num, consecutiveAppearances: consecutive });
      }
    }
    const hottestStreak = streakInfo
      .sort((a, b) => b.consecutiveAppearances - a.consecutiveAppearances)
      .slice(0, 5);

    // Overdue predictions: numbers whose actual absence exceeds expected average interval
    // Expected interval = total rounds / frequency
    const overduePredictions: number[] = [];
    for (let num = LOTTO_CONFIG.MIN_NUMBER; num <= LOTTO_CONFIG.MAX_NUMBER; num++) {
      const frequency = this.calculateFrequency(num, data);
      if (frequency === 0) {
        overduePredictions.push(num);
        continue;
      }
      const expectedInterval = data.length / frequency;
      const lastAppeared = this.calculateLastAppeared(num, data);
      const currentAbsence = latestRound - lastAppeared;
      // Consider "overdue" if absent for more than 1.5x the expected interval
      if (currentAbsence > expectedInterval * 1.5) {
        overduePredictions.push(num);
      }
    }

    return {
      latestRound,
      newNumbers,
      bonusNumber,
      longestAbsent,
      hottestStreak,
      overduePredictions: overduePredictions.slice(0, 10),
    };
  }

  /**
   * 특정 번호의 시계열 트렌드 데이터 생성
   */
  static getTrendTimeSeries(
    number: number,
    data: LottoResult[],
    windowSize: number,
    steps: number
  ): { labels: string[]; values: number[] } {
    const sortedData = [...data].sort((a, b) => a.round - b.round);
    const labels: string[] = [];
    const values: number[] = [];

    // Calculate total data points we can use
    const totalRounds = sortedData.length;
    // Start from the end and work backwards in steps
    const effectiveSteps = Math.min(steps, Math.ceil(totalRounds / windowSize));

    for (let i = 0; i < effectiveSteps; i++) {
      // From latest going backwards
      const endIndex = totalRounds - (i * windowSize);
      const startIndex = Math.max(0, endIndex - windowSize);

      if (startIndex >= endIndex) break;

      const windowData = sortedData.slice(startIndex, endIndex);
      if (windowData.length === 0) break;

      const startRound = windowData[0].round;
      const endRound = windowData[windowData.length - 1].round;
      labels.unshift(`${startRound}-${endRound}`);

      const freq = this.calculateFrequency(number, windowData);
      values.unshift(freq);
    }

    return { labels, values };
  }

  /**
   * 통계 데이터 유효성 검증
   */
  static validateStatistics(statistics: NumberStatistics[]): boolean {
    if (!Array.isArray(statistics) || statistics.length !== 45) {
      console.error(`통계 배열 길이 오류: 예상 45개, 실제 ${statistics.length}개`);
      return false;
    }
    
    for (const stat of statistics) {
      if (!stat || typeof stat.number !== 'number' || 
          stat.number < 1 || stat.number > 45) {
        console.error(`잘못된 번호: ${stat?.number}`);
        return false;
      }
      
      if (typeof stat.frequency !== 'number' || stat.frequency < 0) {
        console.error(`잘못된 빈도: ${stat.frequency}`);
        return false;
      }
      
      if (typeof stat.hotColdScore !== 'number' || 
          stat.hotColdScore < -100 || stat.hotColdScore > 100) {
        console.error(`잘못된 핫콜드점수: ${stat.hotColdScore}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 확장된 번호 통계 생성 (분석 대시보드용)
   */
  static generateExtendedStatistics(lottoData: LottoResult[]): ExtendedNumberStatistics[] {
    console.log(`확장 통계 분석 시작: ${lottoData.length}개 회차 데이터`);
    
    if (lottoData.length === 0) {
      console.warn('로또 데이터가 없어서 기본 확장 통계를 반환합니다.');
      return this.getDefaultExtendedStatistics();
    }
    
    const baseStatistics = this.generateStatistics(lottoData);
    const extendedStatistics: ExtendedNumberStatistics[] = [];
    
    for (const baseStat of baseStatistics) {
      const extendedStat: ExtendedNumberStatistics = {
        ...baseStat,
        recentTrend: this.calculateRecentTrend(baseStat.number, lottoData),
        sectionDistribution: this.calculateSectionNumber(baseStat.number),
        patternScore: this.calculatePatternScore(baseStat.number, lottoData),
        oddEvenType: baseStat.number % 2 === 0 ? 'even' : 'odd',
        recentFrequency: this.calculateRecentFrequency(baseStat.number, lottoData, 20)
      };
      extendedStatistics.push(extendedStat);
    }
    
    console.log(`확장 통계 분석 완료: ${extendedStatistics.length}개 번호 확장 통계 생성`);
    return extendedStatistics;
  }

  /**
   * 최근 트렌드 계산 (rising, falling, stable)
   */
  static calculateRecentTrend(number: number, lottoData: LottoResult[], recentRounds: number = 20): 'rising' | 'falling' | 'stable' {
    if (lottoData.length < recentRounds * 2) {
      return 'stable';
    }
    
    const sortedData = [...lottoData].sort((a, b) => b.round - a.round);
    const recentData = sortedData.slice(0, recentRounds);
    const previousData = sortedData.slice(recentRounds, recentRounds * 2);
    
    const recentFreq = this.calculateFrequency(number, recentData);
    const previousFreq = this.calculateFrequency(number, previousData);
    
    const recentRate = recentFreq / recentRounds;
    const previousRate = previousFreq / recentRounds;
    
    const difference = recentRate - previousRate;
    const threshold = 0.05; // 5% 이상 차이
    
    if (difference > threshold) return 'rising';
    if (difference < -threshold) return 'falling';
    return 'stable';
  }

  /**
   * 구간 번호 계산 (1-9: 1, 10-19: 2, 20-29: 3, 30-39: 4, 40-45: 5)
   */
  static calculateSectionNumber(number: number): number {
    if (number >= 1 && number <= 9) return 1;
    if (number >= 10 && number <= 19) return 2;
    if (number >= 20 && number <= 29) return 3;
    if (number >= 30 && number <= 39) return 4;
    if (number >= 40 && number <= 45) return 5;
    return 0; // 잘못된 번호
  }

  /**
   * 패턴 점수 계산 (종합적인 출현 패턴 점수 0-100)
   */
  static calculatePatternScore(number: number, lottoData: LottoResult[]): number {
    if (lottoData.length === 0) return 50; // 중간값
    
    const frequency = this.calculateFrequency(number, lottoData);
    const consecutiveCount = this.calculateConsecutiveCount(number, lottoData);
    const hotColdScore = this.calculateHotColdScore(number, lottoData);
    const recentFrequency = this.calculateRecentFrequency(number, lottoData, 20);
    
    // 가중 평균으로 패턴 점수 계산
    const frequencyScore = Math.min(100, (frequency / lottoData.length) * 100 * 45); // 전체 평균 대비
    const recentScore = Math.min(100, (recentFrequency / 20) * 100 * 45); // 최근 평균 대비
    const hotColdScoreNormalized = ((hotColdScore + 100) / 2); // -100~100을 0~100으로 변환
    const consecutiveScore = Math.min(100, consecutiveCount * 20); // 연속 출현 보너스
    
    const patternScore = (
      frequencyScore * 0.3 +
      recentScore * 0.3 +
      hotColdScoreNormalized * 0.2 +
      consecutiveScore * 0.2
    );
    
    return Math.round(Math.max(0, Math.min(100, patternScore)));
  }

  /**
   * 구간별 분포 분석
   */
  static calculateSectionDistribution(lottoData: LottoResult[]): SectionDistribution[] {
    const sections = [
      { name: '1-9', number: 1, min: 1, max: 9 },
      { name: '10-19', number: 2, min: 10, max: 19 },
      { name: '20-29', number: 3, min: 20, max: 29 },
      { name: '30-39', number: 4, min: 30, max: 39 },
      { name: '40-45', number: 5, min: 40, max: 45 }
    ];
    
    const distributions: SectionDistribution[] = [];
    const totalNumbers = lottoData.length * 6; // 총 번호 개수
    
    for (const section of sections) {
      let frequency = 0;
      
      // 해당 구간의 모든 번호 출현 빈도 합계
      for (let num = section.min; num <= section.max; num++) {
        frequency += this.calculateFrequency(num, lottoData);
      }
      
      const percentage = totalNumbers > 0 ? (frequency / totalNumbers) * 100 : 0;
      
      // 최근 트렌드 계산 (최근 20회차 vs 이전 20회차)
      const recentTrend = this.calculateSectionTrend(section, lottoData);
      
      distributions.push({
        section: section.name,
        count: frequency,
        percentage: Math.round(percentage * 100) / 100,
        sectionNumber: section.number,
        frequency,
        recentTrend
      });
    }
    
    return distributions;
  }

  /**
   * 구간별 최근 트렌드 계산
   */
  private static calculateSectionTrend(
    section: { min: number; max: number }, 
    lottoData: LottoResult[], 
    recentRounds: number = 20
  ): 'up' | 'down' | 'stable' {
    if (lottoData.length < recentRounds * 2) return 'stable';
    
    const sortedData = [...lottoData].sort((a, b) => b.round - a.round);
    const recentData = sortedData.slice(0, recentRounds);
    const previousData = sortedData.slice(recentRounds, recentRounds * 2);
    
    let recentFreq = 0;
    let previousFreq = 0;
    
    for (let num = section.min; num <= section.max; num++) {
      recentFreq += this.calculateFrequency(num, recentData);
      previousFreq += this.calculateFrequency(num, previousData);
    }
    
    const recentRate = recentFreq / (recentRounds * 6);
    const previousRate = previousFreq / (recentRounds * 6);
    const difference = recentRate - previousRate;
    const threshold = 0.02; // 2% 이상 차이
    
    if (difference > threshold) return 'up';
    if (difference < -threshold) return 'down';
    return 'stable';
  }

  /**
   * 홀짝 패턴 분석
   */
  static analyzeOddEvenPattern(lottoData: LottoResult[]): OddEvenPattern[] {
    const patterns = new Map<string, { count: number; type: 'balanced' | 'odd-heavy' | 'even-heavy' }>();
    
    for (const round of lottoData) {
      let oddCount = 0;
      let evenCount = 0;
      
      for (const number of round.numbers) {
        if (number % 2 === 0) {
          evenCount++;
        } else {
          oddCount++;
        }
      }
      
      const ratio = `${oddCount}:${evenCount}`;
      const patternType = oddCount === evenCount ? 'balanced' : 
                         oddCount > evenCount ? 'odd-heavy' : 'even-heavy';
      
      if (!patterns.has(ratio)) {
        patterns.set(ratio, { count: 0, type: patternType });
      }
      patterns.get(ratio)!.count++;
    }
    
    const result: OddEvenPattern[] = [];
    for (const [ratio, data] of Array.from(patterns.entries())) {
      const [oddStr, evenStr] = ratio.split(':');
      result.push({
        type: `${oddStr}:${evenStr}`,
        count: data.count,
        numbers: parseInt(oddStr) + parseInt(evenStr),
        percentage: Math.round((data.count / lottoData.length) * 100),
        oddCount: parseInt(oddStr),
        evenCount: parseInt(evenStr),
        ratio,
        patternType: data.type,
        frequency: data.count
      });
    }
    
    return result.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
  }

  /**
   * AI 성능 지표 생성
   */
  static generateAIPerformanceMetrics(lottoData: LottoResult[]): AIPerformanceMetrics {
    if (lottoData.length === 0) {
      return {
        predictionAccuracy: 0,
        patternDetectionRate: 0,
        confidenceLevel: 0,
        lastUpdated: new Date().toISOString(),
        totalAnalyzedRounds: 0
      };
    }
    
    // 실제 통계 데이터 기반으로 AI 성능 계산
    const statistics = this.generateStatistics(lottoData);
    const sectionDistributions = this.calculateSectionDistribution(lottoData);
    const oddEvenPatterns = this.analyzeOddEvenPattern(lottoData);
    
    // 예측 정확도 계산 (패턴 일관성 기반)
    const predictionAccuracy = this.calculatePredictionAccuracy(statistics, lottoData);
    
    // 패턴 감지 정확도 (구간별 분포의 일관성)
    const patternDetectionRate = this.calculatePatternDetectionRate(sectionDistributions, oddEvenPatterns);
    
    // 신뢰도 (데이터 양과 분석 품질 기반)
    const confidenceLevel = this.calculateConfidenceLevel(lottoData.length, predictionAccuracy, patternDetectionRate);
    
    return {
      predictionAccuracy: Math.round(predictionAccuracy),
      patternDetectionRate: Math.round(patternDetectionRate),
      confidenceLevel: Math.round(confidenceLevel),
      lastUpdated: new Date().toISOString(),
      totalAnalyzedRounds: lottoData.length
    };
  }

  /**
   * 예측 정확도 계산
   */
  private static calculatePredictionAccuracy(statistics: NumberStatistics[], lottoData: LottoResult[]): number {
    if (statistics.length === 0 || lottoData.length < 10) return 0;
    
    // 핫번호들의 실제 출현 일관성 검사
    const hotNumbers = this.getHotNumbers(statistics, 10);
    let consistencyScore = 0;
    
    for (const hotStat of hotNumbers) {
      const recentFreq = this.calculateRecentFrequency(hotStat.number, lottoData, 10);
      const totalFreq = hotStat.frequency;
      const expectedRecentFreq = (totalFreq / lottoData.length) * 10;
      
      // 예상 빈도와 실제 빈도의 일치도
      const accuracy = 1 - Math.abs(recentFreq - expectedRecentFreq) / Math.max(1, expectedRecentFreq);
      consistencyScore += Math.max(0, accuracy);
    }
    
    return (consistencyScore / hotNumbers.length) * 100;
  }

  /**
   * 패턴 감지 정확도 계산
   */
  private static calculatePatternDetectionRate(sectionDistributions: SectionDistribution[], oddEvenPatterns: OddEvenPattern[]): number {
    // 구간별 분포의 균등성 검사 (너무 편향되지 않았는지)
    const expectedSectionPercentage = 100 / 5; // 20%씩 균등 분포
    let sectionScore = 0;
    
    for (const dist of sectionDistributions) {
      const deviation = Math.abs(dist.percentage - expectedSectionPercentage);
      const accuracy = Math.max(0, 1 - deviation / expectedSectionPercentage);
      sectionScore += accuracy;
    }
    sectionScore = (sectionScore / sectionDistributions.length) * 100;
    
    // 홀짝 패턴의 다양성 검사
    const balancedPatterns = oddEvenPatterns.filter(p => p.patternType === 'balanced');
    const oddEvenScore = balancedPatterns.length > 0 ? 80 : 60; // 균형잡힌 패턴이 있으면 높은 점수
    
    return (sectionScore * 0.7 + oddEvenScore * 0.3);
  }

  /**
   * 신뢰도 계산
   */
  private static calculateConfidenceLevel(totalRounds: number, predictionAccuracy: number, patternDetectionRate: number): number {
    // 데이터 양에 따른 기본 신뢰도
    const dataReliability = Math.min(100, (totalRounds / 1000) * 80 + 20); // 1000회차면 100%, 최소 20%
    
    // 분석 품질에 따른 가중치
    const analysisQuality = (predictionAccuracy + patternDetectionRate) / 2;
    
    // 종합 신뢰도
    return dataReliability * 0.4 + analysisQuality * 0.6;
  }

  /**
   * 기본 확장 통계 데이터 (데이터가 없을 때 사용)
   */
  private static getDefaultExtendedStatistics(): ExtendedNumberStatistics[] {
    const statistics: ExtendedNumberStatistics[] = [];
    
    for (let number = LOTTO_CONFIG.MIN_NUMBER; number <= LOTTO_CONFIG.MAX_NUMBER; number++) {
      statistics.push({
        number,
        frequency: 0,
        lastAppeared: 0,
        hotColdScore: 0,
        consecutiveCount: 0,
        recentTrend: 'stable',
        sectionDistribution: this.calculateSectionNumber(number),
        patternScore: 50,
        oddEvenType: number % 2 === 0 ? 'even' : 'odd',
        recentFrequency: 0
      });
    }
    
    return statistics;
  }
}
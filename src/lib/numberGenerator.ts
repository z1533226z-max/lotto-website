// AI 번호 생성 알고리즘

import { LOTTO_CONFIG } from './constants';
import type { NumberStatistics, WeightedNumber } from '@/types/lotto';

export class NumberGenerator {
  /**
   * AI 추천번호 생성 (통계 기반)
   */
  static generateAINumbers(statistics?: NumberStatistics[]): number[] {
    if (statistics && statistics.length > 0) {
      return this.generateStatisticalNumbers(statistics);
    } else {
      return this.generateRandomNumbers();
    }
  }

  /**
   * 통계 기반 번호 생성
   */
  private static generateStatisticalNumbers(statistics: NumberStatistics[]): number[] {
    const today = new Date();
    const seed = today.getDate() + today.getMonth() + today.getFullYear();
    
    const weightedNumbers = statistics.map(stat => ({
      number: stat.number,
      weight: this.calculateWeight(stat, seed)
    }));
    
    return this.selectRandomWeighted(weightedNumbers, LOTTO_CONFIG.NUMBERS_COUNT);
  }

  /**
   * 가중치 계산
   */
  private static calculateWeight(stat: NumberStatistics, seed: number): number {
    // 기본 가중치 (모든 번호 동일한 기준점)
    const baseWeight = 1.0;
    
    // 출현 빈도 가중치 (30%)
    const averageFrequency = 25; // 평균 출현 빈도 가정
    const frequencyWeight = (stat.frequency / averageFrequency) * 0.3;
    
    // 최근성 가중치 (20%) - 너무 오래 안나온 번호 우대
    const recentnessWeight = Math.max(0, (50 - stat.lastAppeared) / 50) * 0.2;
    
    // 핫/콜드 점수 가중치 (30%)
    const hotColdWeight = (stat.hotColdScore + 100) / 200 * 0.3; // -100~100을 0~1로 정규화
    
    // 날짜 기반 시드 가중치 (20%) - 매일 다른 결과
    const seedFactor = (Math.sin(seed * stat.number * 0.1) + 1) / 2 * 0.2;
    
    return Math.max(0.1, baseWeight + frequencyWeight + recentnessWeight + hotColdWeight + seedFactor);
  }

  /**
   * 가중치 기반 랜덤 선택
   */
  private static selectRandomWeighted(items: WeightedNumber[], count: number): number[] {
    const selected: number[] = [];
    const available = [...items];
    
    while (selected.length < count && available.length > 0) {
      const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
      const random = Math.random() * totalWeight;
      
      let currentWeight = 0;
      for (let i = 0; i < available.length; i++) {
        currentWeight += available[i].weight;
        if (random <= currentWeight) {
          selected.push(available[i].number);
          available.splice(i, 1);
          break;
        }
      }
    }
    
    return selected.sort((a, b) => a - b);
  }

  /**
   * 순수 랜덤 번호 생성
   */
  static generateRandomNumbers(): number[] {
    const numbers: number[] = [];
    const today = new Date();
    const seed = today.getDate() + today.getMonth(); // 매일 다른 시드
    
    // 시드 기반 의사 랜덤 생성
    let randomSeed = seed;
    const seededRandom = () => {
      randomSeed = (randomSeed * 9301 + 49297) % 233280;
      return randomSeed / 233280;
    };
    
    while (numbers.length < LOTTO_CONFIG.NUMBERS_COUNT) {
      const num = Math.floor(seededRandom() * LOTTO_CONFIG.MAX_NUMBER) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * 패턴 기반 번호 생성 (고급)
   */
  static generatePatternNumbers(): number[] {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // 여러 패턴을 조합하여 생성
    const patterns = [
      this.generateFibonacciPattern(),
      this.generatePrimePattern(),
      this.generateSequentialPattern(),
      this.generateOddEvenBalanced(),
      this.generateSumRangeOptimized()
    ];
    
    // 날짜에 따라 패턴 선택
    const selectedPattern = patterns[dayOfYear % patterns.length];
    return selectedPattern;
  }

  /**
   * 피보나치 수열 기반 패턴
   */
  private static generateFibonacciPattern(): number[] {
    const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34];
    const availableFib = fibonacci.filter(n => n <= LOTTO_CONFIG.MAX_NUMBER);
    
    const numbers: number[] = [];
    
    // 피보나치 수에서 몇 개 선택
    const fibCount = Math.min(3, availableFib.length);
    for (let i = 0; i < fibCount; i++) {
      numbers.push(availableFib[i]);
    }
    
    // 나머지는 랜덤으로
    while (numbers.length < LOTTO_CONFIG.NUMBERS_COUNT) {
      const num = Math.floor(Math.random() * LOTTO_CONFIG.MAX_NUMBER) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * 소수 기반 패턴
   */
  private static generatePrimePattern(): number[] {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    const numbers: number[] = [];
    
    // 소수에서 절반 선택
    const primeCount = 3;
    const selectedPrimes = primes.slice(0, primeCount);
    numbers.push(...selectedPrimes);
    
    // 나머지는 랜덤으로
    while (numbers.length < LOTTO_CONFIG.NUMBERS_COUNT) {
      const num = Math.floor(Math.random() * LOTTO_CONFIG.MAX_NUMBER) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * 연속 번호 포함 패턴
   */
  private static generateSequentialPattern(): number[] {
    const numbers: number[] = [];
    
    // 연속된 2개 번호 선택
    const startNum = Math.floor(Math.random() * (LOTTO_CONFIG.MAX_NUMBER - 1)) + 1;
    numbers.push(startNum, startNum + 1);
    
    // 나머지는 랜덤으로 (연속 번호와 겹치지 않게)
    while (numbers.length < LOTTO_CONFIG.NUMBERS_COUNT) {
      const num = Math.floor(Math.random() * LOTTO_CONFIG.MAX_NUMBER) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * 홀짝 균형 패턴
   */
  private static generateOddEvenBalanced(): number[] {
    const numbers: number[] = [];
    const oddNumbers: number[] = [];
    const evenNumbers: number[] = [];
    
    // 홀수와 짝수 배열 생성
    for (let i = 1; i <= LOTTO_CONFIG.MAX_NUMBER; i++) {
      if (i % 2 === 1) {
        oddNumbers.push(i);
      } else {
        evenNumbers.push(i);
      }
    }
    
    // 홀수 3개, 짝수 3개 선택
    const shuffledOdd = oddNumbers.sort(() => Math.random() - 0.5);
    const shuffledEven = evenNumbers.sort(() => Math.random() - 0.5);
    
    numbers.push(...shuffledOdd.slice(0, 3));
    numbers.push(...shuffledEven.slice(0, 3));
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * 합계 범위 최적화 패턴
   */
  private static generateSumRangeOptimized(): number[] {
    const targetSum = 150; // 통계적으로 가장 많이 나오는 합계 범위
    const numbers: number[] = [];
    
    // 첫 번째 번호는 랜덤
    numbers.push(Math.floor(Math.random() * 15) + 1);
    
    // 나머지 번호들을 목표 합계에 맞춰 조정
    while (numbers.length < LOTTO_CONFIG.NUMBERS_COUNT) {
      const currentSum = numbers.reduce((sum, num) => sum + num, 0);
      const remainingNumbers = LOTTO_CONFIG.NUMBERS_COUNT - numbers.length;
      const avgRemaining = (targetSum - currentSum) / remainingNumbers;
      
      // 평균 주변의 번호 선택
      const min = Math.max(1, Math.floor(avgRemaining - 10));
      const max = Math.min(LOTTO_CONFIG.MAX_NUMBER, Math.ceil(avgRemaining + 10));
      
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  /**
   * 다중 세트 생성 (여러 조합)
   */
  static generateMultipleSets(count: number = 5): number[][] {
    const sets: number[][] = [];
    
    for (let i = 0; i < count; i++) {
      if (i === 0) {
        sets.push(this.generateAINumbers());
      } else {
        sets.push(this.generatePatternNumbers());
      }
    }
    
    return sets;
  }

  /**
   * 제외 번호를 고려한 생성
   */
  static generateWithExclusions(excludeNumbers: number[]): number[] {
    const numbers: number[] = [];
    
    while (numbers.length < LOTTO_CONFIG.NUMBERS_COUNT) {
      const num = Math.floor(Math.random() * LOTTO_CONFIG.MAX_NUMBER) + 1;
      if (!numbers.includes(num) && !excludeNumbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }
}
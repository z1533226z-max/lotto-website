// 유틸리티 함수들

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LOTTO_CONFIG, LOTTO_COLORS, LOTTO_TEXT_COLORS, MARKETING_MESSAGES, VIRTUAL_STATS_CONFIG } from './constants';
import type { NumberColorType, LottoResult } from '@/types/lotto';

/**
 * 로또볼 색상 가져오기
 */
export const getBallColor = (num: number): string => {
  if (num <= 10) return LOTTO_COLORS[1];
  if (num <= 20) return LOTTO_COLORS[11];
  if (num <= 30) return LOTTO_COLORS[21];
  if (num <= 40) return LOTTO_COLORS[31];
  return LOTTO_COLORS[41];
};

/**
 * 로또볼 텍스트 색상 가져오기
 */
export const getBallTextColor = (num: number): string => {
  if (num <= 10) return LOTTO_TEXT_COLORS[1];
  if (num <= 20) return LOTTO_TEXT_COLORS[11];
  if (num <= 30) return LOTTO_TEXT_COLORS[21];
  if (num <= 40) return LOTTO_TEXT_COLORS[31];
  return LOTTO_TEXT_COLORS[41];
};

/**
 * 보너스볼 색상 가져오기
 */
export const getBonusBallColor = (): string => LOTTO_COLORS.bonus;
export const getBonusBallTextColor = (): string => LOTTO_TEXT_COLORS.bonus;

/**
 * 숫자 배열을 오름차순으로 정렬
 */
export const sortNumbers = (numbers: number[]): number[] => {
  return [...numbers].sort((a, b) => a - b);
};

/**
 * 유효한 로또번호인지 검사
 */
export const isValidLottoNumber = (num: number): boolean => {
  return Number.isInteger(num) && num >= LOTTO_CONFIG.MIN_NUMBER && num <= LOTTO_CONFIG.MAX_NUMBER;
};

/**
 * 유효한 로또번호 배열인지 검사
 */
export const isValidLottoNumbers = (numbers: number[]): boolean => {
  if (numbers.length !== LOTTO_CONFIG.NUMBERS_COUNT) return false;
  if (new Set(numbers).size !== numbers.length) return false; // 중복 검사
  return numbers.every(isValidLottoNumber);
};

/**
 * 다음 추첨일 계산
 */
export const getNextDrawTime = (): Date => {
  const now = new Date();
  const nextSaturday = new Date(now);
  
  // 다음 토요일 21:00 계산
  const daysUntilSaturday = (LOTTO_CONFIG.DRAW_DAY - now.getDay() + 7) % 7;
  if (daysUntilSaturday === 0 && now.getHours() >= LOTTO_CONFIG.DRAW_HOUR) {
    // 이미 토요일 21시 이후라면 다음주 토요일
    nextSaturday.setDate(now.getDate() + 7);
  } else {
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
  }
  
  nextSaturday.setHours(LOTTO_CONFIG.DRAW_HOUR, LOTTO_CONFIG.DRAW_MINUTE, 0, 0);
  return nextSaturday;
};

/**
 * 카운트다운 포맷팅
 */
export const formatCountdown = (targetTime: Date): string => {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  
  if (diff <= 0) return '추첨 완료';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
};

/**
 * 랜덤 마케팅 문구 가져오기
 */
export const getRandomMarketingText = (): string => {
  const today = new Date();
  const seed = today.getDate() + today.getMonth();
  return MARKETING_MESSAGES[seed % MARKETING_MESSAGES.length];
};

/**
 * 가상 사용자 수 생성
 */
export const generateVirtualUserCount = (): number => {
  const now = new Date();
  const timeVariation = Math.sin((now.getTime() / 1000000)) * VIRTUAL_STATS_CONFIG.USER_VARIATION;
  const randomVariation = Math.random() * 30;
  
  return Math.floor(VIRTUAL_STATS_CONFIG.BASE_USERS + timeVariation + randomVariation);
};

/**
 * 가상 일일 생성 수 
 */
export const generateVirtualGenerationCount = (): number => {
  const now = new Date();
  const timeVariation = Math.sin((now.getTime() / 500000)) * VIRTUAL_STATS_CONFIG.GENERATION_VARIATION;
  const randomVariation = Math.random() * 20;
  
  return Math.floor(VIRTUAL_STATS_CONFIG.GENERATION_BASE + timeVariation + randomVariation);
};

/**
 * 숫자를 천단위 콤마로 포맷팅
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

/**
 * 금액을 한국어로 포맷팅
 */
export const formatCurrency = (amount: number): string => {
  if (amount >= 100000000) {
    return `${Math.floor(amount / 100000000)}억 ${Math.floor((amount % 100000000) / 10000)}만원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만원`;
  }
  return `${formatNumber(amount)}원`;
};

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date);
};

/**
 * 클립보드에 텍스트 복사
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    return false;
  }
};

/**
 * 배열을 무작위로 섞기 (Fisher-Yates shuffle)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 홀짝 비율 계산
 */
export const calculateOddEvenRatio = (numbers: number[]): { odd: number; even: number } => {
  const odd = numbers.filter(num => num % 2 === 1).length;
  const even = numbers.length - odd;
  return { odd, even };
};

/**
 * 번호 합계 계산
 */
export const calculateSum = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

/**
 * 연속번호 개수 계산
 */
export const countConsecutiveNumbers = (numbers: number[]): number => {
  const sorted = sortNumbers(numbers);
  let consecutiveCount = 0;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      consecutiveCount++;
    }
  }
  
  return consecutiveCount;
};

/**
 * CSS 클래스 이름 합치기 (shadcn/ui 호환)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 당첨 등수 계산
 */
export const calculateRank = (matchCount: number, bonusMatch: boolean = false): number => {
  switch (matchCount) {
    case 6: return 1; // 1등
    case 5: return bonusMatch ? 2 : 3; // 2등 또는 3등
    case 4: return 4; // 4등
    case 3: return 5; // 5등
    default: return 0; // 꽝
  }
};

/**
 * 지연 함수 (Promise 기반)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 로컬스토리지 안전하게 사용하기
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
// 로또 관련 타입 정의

export interface LottoResult {
  round: number;           // 회차
  drawDate: string;        // 추첨일 (YYYY-MM-DD)
  numbers: number[];       // 당첨번호 [1-45]
  bonusNumber: number;     // 보너스번호
  prizeMoney: {
    first: number;         // 1등 당첨금
    firstWinners: number;  // 1등 당첨자 수
    second: number;        // 2등 당첨금
    secondWinners: number; // 2등 당첨자 수
    totalSales?: number;   // 총 판매금액 (선택적)
  };
}

export interface NumberStatistics {
  number: number;
  frequency: number;        // 출현 빈도
  lastAppeared: number;     // 마지막 출현 회차
  hotColdScore: number;     // 핫/콜드 점수 (-100 ~ 100)
  consecutiveCount: number; // 연속 출현 횟수
}

// 확장된 번호 통계 (분석 대시보드용)
export interface ExtendedNumberStatistics extends NumberStatistics {
  recentTrend: 'rising' | 'falling' | 'stable';  // 최근 트렌드
  sectionDistribution: number;  // 구간별 분포 (1-9: 1, 10-19: 2, 20-29: 3, 30-39: 4, 40-45: 5)
  patternScore: number;         // 패턴 점수 (0-100)
  oddEvenType: 'odd' | 'even';  // 홀짝 분류
  recentFrequency: number;      // 최근 20회차 출현 빈도
}

export interface SavedNumbers {
  id: string;
  numbers: number[];
  createdAt: string;
  memo?: string;
  isAI: boolean;        // AI 추천 여부
}

export interface SimulationResult {
  round: number;
  matchCount: number;
  prize: number;
  rank: number;
}

export interface WeightedNumber {
  number: number;
  weight: number;
}

// UI 컴포넌트 Props 타입들
export interface LottoNumbersProps {
  numbers: number[];
  bonusNumber?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export interface AdBannerProps {
  slot: string;
  size: 'leaderboard' | 'rectangle' | 'skyscraper' | 'mobile';
  className?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

// 분석 관련 타입들
export interface FrequencyData {
  number: number;
  count: number;
  percentage: number;
  rank: number;
}

export interface TrendData {
  round: number;
  oddEvenRatio: number;
  sumRange: number;
  consecutiveCount: number;
}

// AI 성능 검증 타입
export interface AIPerformanceMetrics {
  predictionAccuracy: number;     // 예측 적중률 (0-100)
  patternDetectionRate: number;   // 패턴 감지 정확도 (0-100)
  confidenceLevel: number;        // 신뢰도 (0-100)
  lastUpdated: string;           // 마지막 업데이트 시간
  totalAnalyzedRounds: number;   // 분석된 총 회차 수
}

// 구간별 분포 분석 타입
export interface SectionDistribution {
  section: string;          // 구간명 (예: "1-9", "10-19")
  count: number;            // 해당 구간 출현 횟수
  percentage: number;       // 전체 대비 비율
  sectionNumber?: number;   // 구간 번호 (1, 2, 3, 4, 5) - 선택적
  frequency?: number;       // 해당 구간 출현 빈도 (count와 동일, 호환성)
  recentTrend?: 'up' | 'down' | 'stable';  // 최근 트렌드 - 선택적
}

// 홀짝 패턴 분석 타입
export interface OddEvenPattern {
  type: string;             // 타입명 (예: "홀수", "짝수")
  count: number;            // 해당 타입 개수
  numbers: number;          // 해당 타입에 속하는 번호의 개수
  percentage: number;       // 전체 대비 비율
  oddCount?: number;        // 홀수 개수 - 선택적
  evenCount?: number;       // 짝수 개수 - 선택적
  ratio?: string;           // 비율 표시 (예: "3:3", "4:2") - 선택적
  patternType?: 'balanced' | 'odd-heavy' | 'even-heavy';  // 패턴 유형 - 선택적
  frequency?: number;       // 해당 패턴 출현 빈도 - 선택적
}

// 트렌드 분석 결과 타입
export interface TrendAnalysisResult {
  number: number;
  shortTermTrend: 'rising' | 'falling' | 'stable';    // 단기 트렌드 (최근 10회차)
  mediumTermTrend: 'rising' | 'falling' | 'stable';   // 중기 트렌드 (최근 50회차)
  longTermTrend: 'rising' | 'falling' | 'stable';     // 장기 트렌드 (최근 100회차)
  trendScore: number;       // 종합 트렌드 점수 (-100 ~ 100)
}

// API 응답 타입들
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type LottoApiResponse = ApiResponse<LottoResult>;
export type StatisticsApiResponse = ApiResponse<NumberStatistics[]>;

// 색상 매핑 타입
export type NumberColorType = 'red' | 'orange' | 'yellow' | 'blue' | 'purple' | 'bonus';

// 마케팅 문구 타입
export type MarketingMessageType = string[];

// 가상 활동 통계 타입
export interface VirtualStats {
  currentUsers: number;
  generatedToday: number;
  lastUpdate: string;
}

// 환경변수 타입
export interface EnvConfig {
  ADSENSE_CLIENT_ID: string;
  GA_MEASUREMENT_ID: string;
  LOTTO_API_KEY?: string;
}

// 데이터베이스 통계 타입
export interface DatabaseStats {
  totalRounds: number;
  latestRound: number;
  earliestRound: number;
  lastUpdated: Date;
}
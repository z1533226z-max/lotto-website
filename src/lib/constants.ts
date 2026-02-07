// 상수 정의

export const LOTTO_CONFIG = {
  MIN_NUMBER: 1,
  MAX_NUMBER: 45,
  NUMBERS_COUNT: 6,
  DRAW_DAY: 6, // 토요일 (0=일요일, 6=토요일)
  DRAW_HOUR: 21, // 21시
  DRAW_MINUTE: 0,
} as const;

export const LOTTO_COLORS = {
  1: 'bg-lotto-red',      // 1-10번
  11: 'bg-lotto-orange',  // 11-20번  
  21: 'bg-lotto-yellow',  // 21-30번
  31: 'bg-lotto-blue',    // 31-40번
  41: 'bg-lotto-purple',  // 41-45번
  bonus: 'bg-lotto-bonus', // 보너스번호
} as const;

export const LOTTO_TEXT_COLORS = {
  1: 'text-white',
  11: 'text-white',
  21: 'text-black',
  31: 'text-white',
  41: 'text-white',
  bonus: 'text-black',
} as const;

export const MARKETING_MESSAGES = [
  "AI가 전체 회차 데이터를 딥러닝 분석한 결과",
  "머신러닝 알고리즘이 발견한 숨겨진 패턴",
  "빅데이터 분석으로 예측한 고확률 번호",
  "신경망이 계산한 다음회차 최적 조합",
  "AI가 찾아낸 황금비율 번호",
  "통계학적 분석으로 도출한 추천번호",
  "패턴 인식 AI가 선별한 특별번호",
  "역대 전체 회차 데이터 기반 예측번호"
] as const;

export const AD_SLOTS = {
  DESKTOP: {
    HEADER: 'header-728x90',
    SIDEBAR: 'sidebar-160x600', 
    CONTENT: 'content-300x250',
    FOOTER: 'footer-336x280'
  },
  MOBILE: {
    TOP: 'mobile-top-320x50',
    CONTENT: 'mobile-content-300x250',
    BOTTOM: 'mobile-bottom-320x50'
  }
} as const;

export const SIZE_CLASSES = {
  BALL: {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg', 
    lg: 'w-16 h-16 text-xl'
  },
  BUTTON: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
} as const;

export const ANIMATION_DELAYS = {
  BALL_BOUNCE: 150, // 각 볼의 애니메이션 딜레이 (ms) - 더 빠르게
  GENERATION_TIME: 2000, // AI 번호 생성 시간 (ms) - 더 빠르게
  CHART_LOAD: 1000, // 차트 로딩 애니메이션 시간 (ms)
} as const;

export const PRIZE_RANKS = {
  1: { name: '1등', description: '6개 번호 일치' },
  2: { name: '2등', description: '5개 번호 + 보너스번호 일치' },
  3: { name: '3등', description: '5개 번호 일치' },
  4: { name: '4등', description: '4개 번호 일치' },
  5: { name: '5등', description: '3개 번호 일치' },
  0: { name: '꽝', description: '아쉽게도 당첨되지 않았습니다' }
} as const;

export const VIRTUAL_STATS_CONFIG = {
  BASE_USERS: 150,
  USER_VARIATION: 50,
  GENERATION_BASE: 50,
  GENERATION_VARIATION: 20,
  UPDATE_INTERVAL: 30000, // 30초마다 업데이트
} as const;

export const CHART_COLORS = {
  primary: '#FF6B35',
  secondary: '#004E98', 
  accent: '#FFD23F',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  gray: '#6B7280',
  // 차트용 색상 배열
  sections: ['#FF6B35', '#004E98', '#FFD23F', '#10B981', '#F59E0B'],
  bars: ['#FF6B35', '#004E98', '#FFD23F', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6']
} as const;
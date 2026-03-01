/**
 * 전역 Window 인터페이스 확장
 * - __trackAction: 게이미피케이션 액션 추적 (GamificationProvider에서 등록)
 * - gtag: Google Analytics 이벤트 전송
 * - recordUserActivity: 사용자 활동 기록 (UserEngagementPanel에서 등록)
 */
interface Window {
  __trackAction?: (action: string) => void;
  gtag?: (...args: unknown[]) => void;
  recordUserActivity?: (action: string) => void;
}

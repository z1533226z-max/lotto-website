-- ============================================
-- Phase 6: 관리자 시스템
-- 회원 차단 기능 + rate_limits 확장
-- ============================================

-- 1. 회원 차단 기능
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- 2. rate_limits 테이블에 register 액션 허용
ALTER TABLE rate_limits DROP CONSTRAINT IF EXISTS rate_limits_action_type_check;
ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_action_type_check
  CHECK (action_type IN ('post', 'comment', 'register'));

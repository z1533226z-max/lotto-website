-- ============================================
-- 로또킹 회원 시스템 스키마
-- Phase 4: 하이브리드 회원 시스템
-- ============================================

-- 1. 회원 프로필 테이블
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT UNIQUE NOT NULL CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 15),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname ON user_profiles(nickname);

-- 2. 회원 진행상황 테이블
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  visit_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_visit_date DATE,
  first_visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_generations INTEGER NOT NULL DEFAULT 0,
  simulator_runs INTEGER NOT NULL DEFAULT 0,
  dream_generations INTEGER NOT NULL DEFAULT 0,
  fortune_generations INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  unlocked_badges TEXT[] NOT NULL DEFAULT '{}',
  daily_challenge_completed DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_progress_streak ON user_progress(longest_streak DESC);

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 회원 프로필: 누구나 읽기/쓰기 (service role에서 관리)
CREATE POLICY "user_profiles_read" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (true);

-- 진행상황: 누구나 읽기/쓰기 (service role에서 관리)
CREATE POLICY "user_progress_read" ON user_progress
  FOR SELECT USING (true);

CREATE POLICY "user_progress_insert" ON user_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_progress_update" ON user_progress
  FOR UPDATE USING (true);

-- ============================================
-- 트리거: updated_at 자동 갱신
-- ============================================

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

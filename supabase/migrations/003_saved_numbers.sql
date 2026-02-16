-- ============================================
-- Phase 5: 번호 히스토리 시스템
-- 회원의 생성 번호 저장 + 당첨 자동 확인
-- ============================================

-- 1. 저장 번호 테이블
CREATE TABLE IF NOT EXISTS saved_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  numbers INTEGER[] NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ai', 'dream', 'fortune')),
  round_target INTEGER NOT NULL,
  matched_count INTEGER,
  bonus_matched BOOLEAN,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_saved_numbers_user_created ON saved_numbers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_numbers_unchecked ON saved_numbers(round_target) WHERE checked_at IS NULL;

-- RLS
ALTER TABLE saved_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_numbers_read" ON saved_numbers
  FOR SELECT USING (true);

CREATE POLICY "saved_numbers_insert" ON saved_numbers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "saved_numbers_update" ON saved_numbers
  FOR UPDATE USING (true);

CREATE POLICY "saved_numbers_delete" ON saved_numbers
  FOR DELETE USING (true);

-- 2. user_progress에 새 카운터 추가
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS saved_numbers_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS match_checks_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS multi_set_generations INTEGER NOT NULL DEFAULT 0;

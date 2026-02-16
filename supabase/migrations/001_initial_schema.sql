-- ============================================
-- 로또킹 사이트 DB 스키마
-- Supabase (PostgreSQL) 마이그레이션
-- ============================================

-- 1. 당첨 판매점 테이블
CREATE TABLE IF NOT EXISTS winning_stores (
  id BIGSERIAL PRIMARY KEY,
  round INTEGER NOT NULL,
  rank INTEGER NOT NULL CHECK (rank IN (1, 2)),
  store_name TEXT NOT NULL,
  store_address TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',        -- 시/도 (서울, 경기 등)
  sub_region TEXT NOT NULL DEFAULT '',     -- 구/군 (강남구, 수원시 등)
  purchase_type TEXT NOT NULL DEFAULT '자동' CHECK (purchase_type IN ('자동', '수동', '반자동')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_winning_stores_round ON winning_stores(round DESC);
CREATE INDEX IF NOT EXISTS idx_winning_stores_rank ON winning_stores(rank);
CREATE INDEX IF NOT EXISTS idx_winning_stores_region ON winning_stores(region);
CREATE UNIQUE INDEX IF NOT EXISTS idx_winning_stores_unique
  ON winning_stores(round, rank, store_name, store_address);

-- 2. 커뮤니티 게시글 테이블
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 20),
  password_hash TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 2 AND char_length(title) <= 100),
  content TEXT NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 5000),
  category TEXT NOT NULL DEFAULT '자유' CHECK (category IN ('자유', '예측', '후기', '팁')),
  likes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned DESC, created_at DESC);

-- 3. 커뮤니티 댓글 테이블 (대댓글 지원)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,  -- 대댓글용
  nickname TEXT NOT NULL CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 20),
  password_hash TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 4. 스팸 방지용 rate limiting 테이블
CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  ip_address INET NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('post', 'comment')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action ON rate_limits(ip_address, action_type, created_at DESC);

-- 자동 정리: 1시간 이상된 rate limit 기록 삭제 (pg_cron 또는 수동)
-- DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- 당첨 판매점: 누구나 읽기 가능, 서비스 키로만 쓰기
ALTER TABLE winning_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "winning_stores_read_all" ON winning_stores
  FOR SELECT USING (true);

CREATE POLICY "winning_stores_insert_service" ON winning_stores
  FOR INSERT WITH CHECK (true);  -- service role에서만 사용

-- 게시글: 누구나 읽기/쓰기 가능 (비밀번호로 수정/삭제 관리)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_read_all" ON posts
  FOR SELECT USING (true);

CREATE POLICY "posts_insert_all" ON posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "posts_update_all" ON posts
  FOR UPDATE USING (true);

CREATE POLICY "posts_delete_all" ON posts
  FOR DELETE USING (true);

-- 댓글: 누구나 읽기/쓰기 가능
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_read_all" ON comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_all" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "comments_update_all" ON comments
  FOR UPDATE USING (true);

CREATE POLICY "comments_delete_all" ON comments
  FOR DELETE USING (true);

-- Rate limits: 서버에서만 관리
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_all" ON rate_limits
  FOR ALL USING (true);

-- ============================================
-- 트리거: updated_at 자동 갱신
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 뷰: 게시글 목록 (댓글 수 포함)
-- ============================================

CREATE OR REPLACE VIEW posts_with_comment_count AS
SELECT
  p.id,
  p.nickname,
  p.title,
  p.category,
  p.likes,
  p.views,
  p.is_pinned,
  p.created_at,
  p.updated_at,
  COUNT(c.id)::INTEGER AS comment_count
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id;

/**
 * Supabase Database 타입 정의
 *
 * DB 스키마:
 * - winning_stores: 당첨 판매점 정보
 * - posts: 커뮤니티 게시글
 * - comments: 커뮤니티 댓글 (대댓글 지원)
 * - user_profiles: 회원 프로필
 * - user_progress: 회원 진행상황
 * - saved_numbers: 저장 번호 히스토리
 * - rate_limits: IP 기반 요청 제한
 */

export interface Database {
  public: {
    Tables: {
      winning_stores: {
        Row: WinningStore;
        Insert: WinningStoreInsert;
        Update: Partial<WinningStoreInsert>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: Partial<PostInsert>;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: Partial<CommentInsert>;
        Relationships: [];
      };
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: Partial<UserProfileInsert>;
        Relationships: [];
      };
      user_progress: {
        Row: UserProgressRow;
        Insert: UserProgressInsert;
        Update: Partial<UserProgressInsert>;
        Relationships: [];
      };
      saved_numbers: {
        Row: SavedNumber;
        Insert: SavedNumberInsert;
        Update: Partial<SavedNumberInsert>;
        Relationships: [];
      };
      rate_limits: {
        Row: RateLimit;
        Insert: RateLimitInsert;
        Update: Partial<RateLimitInsert>;
        Relationships: [];
      };
    };
    Views: {
      posts_with_comment_count: {
        Row: PostWithCommentCount;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      post_category: PostCategory;
      purchase_type: PurchaseType;
    };
  };
}

// ============================================
// 당첨 판매점 관련 타입
// ============================================

export type PurchaseType = '자동' | '수동' | '반자동';

export type WinningStore = {
  id: number;
  round: number;
  rank: number; // 1등 또는 2등
  store_name: string;
  store_address: string;
  region: string; // 시/도 (서울, 경기 등)
  sub_region: string; // 구/군 (강남구, 수원시 등)
  purchase_type: PurchaseType;
  created_at: string;
};

export type WinningStoreInsert = {
  round: number;
  rank: number;
  store_name: string;
  store_address: string;
  region: string;
  sub_region: string;
  purchase_type: PurchaseType;
  created_at?: string;
};

// ============================================
// 커뮤니티 게시글 관련 타입
// ============================================

export type PostCategory = '자유' | '예측' | '후기' | '팁';

export type Post = {
  id: string; // UUID
  nickname: string;
  password_hash: string;
  title: string;
  content: string;
  category: PostCategory;
  likes: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type PostInsert = {
  nickname: string;
  password_hash: string;
  title: string;
  content: string;
  category: PostCategory;
  likes?: number;
  views?: number;
  is_pinned?: boolean;
};

// 클라이언트에서 게시글 작성 시 보내는 데이터 (해시 전)
export interface PostCreateRequest {
  nickname: string;
  password: string; // 평문 비밀번호 (서버에서 해시)
  title: string;
  content: string;
  category: PostCategory;
}

// 게시글 수정/삭제 시 비밀번호 확인
export interface PostActionRequest {
  password: string;
}

// 게시글 목록 조회 시 반환 타입 (비밀번호 제외)
export interface PostListItem {
  id: string;
  nickname: string;
  title: string;
  category: PostCategory;
  likes: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
  comment_count: number;
}

// ============================================
// 커뮤니티 댓글 관련 타입
// ============================================

export type Comment = {
  id: string; // UUID
  post_id: string; // FK → posts.id
  parent_id: string | null; // FK → comments.id (대댓글)
  nickname: string;
  password_hash: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
};

export type CommentInsert = {
  post_id: string;
  parent_id?: string | null;
  nickname: string;
  password_hash: string;
  content: string;
  likes?: number;
};

// 클라이언트에서 댓글 작성 시 보내는 데이터
export interface CommentCreateRequest {
  post_id: string;
  parent_id?: string | null;
  nickname: string;
  password: string;
  content: string;
}

// 댓글 목록 조회 시 반환 타입 (비밀번호 제외, 대댓글 포함)
export interface CommentWithReplies {
  id: string;
  post_id: string;
  parent_id: string | null;
  nickname: string;
  content: string;
  likes: number;
  created_at: string;
  replies?: CommentWithReplies[];
}

// ============================================
// 당첨 판매점 관련 API 타입
// ============================================

export interface StoreFilters {
  round?: number;
  rank?: number;
  region?: string;
  sub_region?: string;
  page?: number;
  limit?: number;
}

export interface RegionStats {
  region: string;
  count: number;
  firstPrizeCount: number;
  secondPrizeCount: number;
}

// ============================================
// 회원 프로필 관련 타입
// ============================================

export type UserProfile = {
  id: string; // UUID
  nickname: string;
  password_hash: string;
  is_banned: boolean;
  banned_reason: string | null;
  created_at: string;
  last_login_at: string;
};

export type UserProfileInsert = {
  nickname: string;
  password_hash: string;
  is_banned?: boolean;
  banned_reason?: string | null;
  created_at?: string;
  last_login_at?: string;
};

// ============================================
// 회원 진행상황 관련 타입
// ============================================

export type UserProgressRow = {
  user_id: string; // FK → user_profiles.id
  visit_streak: number;
  longest_streak: number;
  last_visit_date: string | null; // DATE
  first_visit_date: string; // DATE
  ai_generations: number;
  simulator_runs: number;
  dream_generations: number;
  fortune_generations: number;
  page_views: number;
  unlocked_badges: string[];
  daily_challenge_completed: string | null; // DATE
  saved_numbers_count: number;
  match_checks_count: number;
  multi_set_generations: number;
  updated_at: string;
};

export type UserProgressInsert = {
  user_id: string;
  visit_streak?: number;
  longest_streak?: number;
  last_visit_date?: string | null;
  first_visit_date?: string | null;
  ai_generations?: number;
  simulator_runs?: number;
  dream_generations?: number;
  fortune_generations?: number;
  page_views?: number;
  unlocked_badges?: string[];
  daily_challenge_completed?: string | null;
  saved_numbers_count?: number;
  match_checks_count?: number;
  multi_set_generations?: number;
  updated_at?: string;
};

// 리더보드 항목 타입
export interface LeaderboardEntry {
  nickname: string;
  longest_streak: number;
  badge_count: number;
  rank: number;
}

// ============================================
// 저장 번호 히스토리 관련 타입
// ============================================

export type NumberSource = 'ai' | 'dream' | 'fortune';

export type SavedNumber = {
  id: string; // UUID
  user_id: string; // FK → user_profiles.id
  numbers: number[]; // INTEGER[]
  source: NumberSource;
  round_target: number;
  matched_count: number | null;
  bonus_matched: boolean | null;
  checked_at: string | null; // TIMESTAMPTZ
  created_at: string;
};

export type SavedNumberInsert = {
  user_id: string;
  numbers: number[];
  source: NumberSource;
  round_target: number;
  matched_count?: number | null;
  bonus_matched?: boolean | null;
  checked_at?: string | null;
};

// API 요청/응답 타입
export interface SaveNumberRequest {
  numbers: number[][]; // 1세트 또는 5세트
  source: NumberSource;
  roundTarget: number;
}

export interface NumberStats {
  totalSaved: number;
  bySource: { ai: number; dream: number; fortune: number };
  bestMatch: number;
  totalChecked: number;
  matchDistribution: Record<number, number>; // { 0: 10, 1: 5, 2: 3, ... }
}

// ============================================
// Rate Limits 관련 타입
// ============================================

export type RateLimit = {
  id: number;
  ip_address: string;
  action_type: string; // 'register' | 'post' | 'comment'
  created_at: string;
};

export type RateLimitInsert = {
  ip_address: string;
  action_type: string;
  created_at?: string;
};

// ============================================
// 뷰 관련 타입
// ============================================

export type PostWithCommentCount = Post & {
  comment_count: number;
};

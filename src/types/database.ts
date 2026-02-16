/**
 * Supabase Database 타입 정의
 *
 * DB 스키마:
 * - winning_stores: 당첨 판매점 정보
 * - posts: 커뮤니티 게시글
 * - comments: 커뮤니티 댓글 (대댓글 지원)
 * - user_profiles: 회원 프로필
 * - user_progress: 회원 진행상황
 */

export interface Database {
  public: {
    Tables: {
      winning_stores: {
        Row: WinningStore;
        Insert: WinningStoreInsert;
        Update: Partial<WinningStoreInsert>;
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: Partial<PostInsert>;
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: Partial<CommentInsert>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: Partial<UserProfileInsert>;
      };
      user_progress: {
        Row: UserProgressRow;
        Insert: UserProgressInsert;
        Update: Partial<UserProgressInsert>;
      };
    };
    Views: Record<string, never>;
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

export interface WinningStore {
  id: number;
  round: number;
  rank: number; // 1등 또는 2등
  store_name: string;
  store_address: string;
  region: string; // 시/도 (서울, 경기 등)
  sub_region: string; // 구/군 (강남구, 수원시 등)
  purchase_type: PurchaseType;
  created_at: string;
}

export interface WinningStoreInsert {
  round: number;
  rank: number;
  store_name: string;
  store_address: string;
  region: string;
  sub_region: string;
  purchase_type: PurchaseType;
  created_at?: string;
}

// ============================================
// 커뮤니티 게시글 관련 타입
// ============================================

export type PostCategory = '자유' | '예측' | '후기' | '팁';

export interface Post {
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
}

export interface PostInsert {
  nickname: string;
  password_hash: string;
  title: string;
  content: string;
  category: PostCategory;
  likes?: number;
  views?: number;
  is_pinned?: boolean;
}

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

export interface Comment {
  id: string; // UUID
  post_id: string; // FK → posts.id
  parent_id: string | null; // FK → comments.id (대댓글)
  nickname: string;
  password_hash: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface CommentInsert {
  post_id: string;
  parent_id?: string | null;
  nickname: string;
  password_hash: string;
  content: string;
  likes?: number;
}

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

export interface UserProfile {
  id: string; // UUID
  nickname: string;
  password_hash: string;
  created_at: string;
  last_login_at: string;
}

export interface UserProfileInsert {
  nickname: string;
  password_hash: string;
  created_at?: string;
  last_login_at?: string;
}

// ============================================
// 회원 진행상황 관련 타입
// ============================================

export interface UserProgressRow {
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
  updated_at: string;
}

export interface UserProgressInsert {
  user_id: string;
  visit_streak?: number;
  longest_streak?: number;
  last_visit_date?: string | null;
  first_visit_date?: string;
  ai_generations?: number;
  simulator_runs?: number;
  dream_generations?: number;
  fortune_generations?: number;
  page_views?: number;
  unlocked_badges?: string[];
  daily_challenge_completed?: string | null;
}

// 리더보드 항목 타입
export interface LeaderboardEntry {
  nickname: string;
  longest_streak: number;
  badge_count: number;
  rank: number;
}

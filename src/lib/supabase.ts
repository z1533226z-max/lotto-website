import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const _url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const _anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!_url || !_anonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
}

const supabaseUrl: string = _url;
const supabaseAnonKey: string = _anonKey;

/**
 * 브라우저/클라이언트용 Supabase 클라이언트
 * - 게시판 읽기, 댓글 작성 등 일반 사용자 작업에 사용
 * - anon key로 RLS(Row Level Security) 정책 적용
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * 서버 전용 Supabase 클라이언트 (Service Role)
 * - 서버 API 라우트에서만 사용
 * - RLS 우회하여 관리자 작업 수행 (스크래핑 데이터 저장 등)
 * - 절대 클라이언트에 노출하지 않음
 */
export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Supabase 연결 확인 유틸리티
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('winning_stores').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

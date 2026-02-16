/**
 * Supabase 마이그레이션 적용 스크립트
 *
 * Supabase 대시보드의 SQL Editor에서 아래 SQL을 실행해주세요:
 * 파일: supabase/migrations/002_user_system.sql
 *
 * 또는 이 스크립트로 테이블 존재 여부를 확인할 수 있습니다.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ejsiahajufgniyvttkpc.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkTables() {
  console.log('Checking user_profiles table...');
  const { data: profiles, error: profileErr } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1);

  if (profileErr) {
    console.log('❌ user_profiles table not found:', profileErr.message);
    console.log('\n📋 Please run the following SQL in Supabase Dashboard > SQL Editor:');
    console.log('   File: supabase/migrations/002_user_system.sql\n');
    return false;
  }

  console.log('✅ user_profiles table exists');

  console.log('Checking user_progress table...');
  const { data: progress, error: progressErr } = await supabase
    .from('user_progress')
    .select('user_id')
    .limit(1);

  if (progressErr) {
    console.log('❌ user_progress table not found:', progressErr.message);
    return false;
  }

  console.log('✅ user_progress table exists');
  console.log('\n✅ All tables are ready!');
  return true;
}

checkTables().catch(console.error);

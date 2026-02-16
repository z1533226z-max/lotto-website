import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * DELETE: 댓글 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 댓글 조회 (비밀번호 해시 포함)
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id, password_hash, post_id')
      .eq('id', id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { success: false, error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, (comment as any).password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 하위 댓글(대댓글)도 삭제
    await supabase.from('comments').delete().eq('parent_id', id);

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Comment delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: '댓글 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '댓글이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Comment delete API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

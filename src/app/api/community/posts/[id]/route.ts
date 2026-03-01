import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import type { PostCategory } from '@/types/database';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES: PostCategory[] = ['자유', '예측', '후기', '팁'];

/**
 * GET: 게시글 상세 조회 + 조회수 증가
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getServiceSupabase();

    // 게시글 조회 (password_hash 제외)
    const { data: post, error } = await supabase
      .from('posts')
      .select('id, nickname, title, content, category, likes, views, is_pinned, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가 (비동기, 에러 무시)
    supabase
      .from('posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', id)
      .then();

    // 댓글 조회 (password_hash 제외)
    const { data: comments } = await supabase
      .from('comments')
      .select('id, post_id, parent_id, nickname, content, likes, created_at, updated_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      success: true,
      post: { ...post, views: (post.views || 0) + 1 },
      comments: comments || [],
    });
  } catch (error) {
    console.error('Post detail API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: 게시글 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { password, title, content, category } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 게시글 조회 (비밀번호 해시 포함)
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, password_hash')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, post.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 수정할 데이터 구성
    const updateData: Record<string, string> = {};
    if (title !== undefined) {
      if (title.length < 2 || title.length > 100) {
        return NextResponse.json(
          { success: false, error: '제목은 2~100자로 입력해주세요.' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }
    if (content !== undefined) {
      if (content.length < 5 || content.length > 5000) {
        return NextResponse.json(
          { success: false, error: '내용은 5~5000자로 입력해주세요.' },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category as PostCategory)) {
        return NextResponse.json(
          { success: false, error: '올바른 카테고리를 선택해주세요.' },
          { status: 400 }
        );
      }
      updateData.category = category;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '수정할 내용이 없습니다.' },
        { status: 400 }
      );
    }

    // 게시글 수정
    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select('id, nickname, title, content, category, likes, views, is_pinned, created_at, updated_at')
      .single();

    if (updateError) {
      console.error('Post update error:', updateError);
      return NextResponse.json(
        { success: false, error: '게시글 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updated,
    });
  } catch (error) {
    console.error('Post update API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 게시글 삭제
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

    // 게시글 조회 (비밀번호 해시 포함)
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, password_hash')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isValidDel = await bcrypt.compare(password, post.password_hash);
    if (!isValidDel) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 댓글 먼저 삭제
    await supabase.from('comments').delete().eq('post_id', id);

    // 게시글 삭제
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Post delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: '게시글 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Post delete API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

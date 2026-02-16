'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CommentSection from '@/components/community/CommentSection';
import type { PostCategory } from '@/types/database';

interface PostDetail {
  id: string;
  nickname: string;
  title: string;
  content: string;
  category: PostCategory;
  likes: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface CommentData {
  id: string;
  post_id: string;
  parent_id: string | null;
  nickname: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

const categoryBadgeVariant: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  '자유': 'info',
  '예측': 'primary',
  '후기': 'success',
  '팁': 'warning',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function CommunityPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 비밀번호 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState<'edit' | 'delete' | null>(null);
  const [modalPassword, setModalPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // 좋아요 상태
  const [liked, setLiked] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}`);
      const data = await res.json();

      if (!data.success) {
        setError(data.error || '게시글을 찾을 수 없습니다.');
        return;
      }

      setPost(data.post);
      setComments(data.comments || []);
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, fetchPost]);

  // 좋아요
  const handleLike = async () => {
    if (liked || !post) return;

    try {
      // 좋아요 API (간단하게 PATCH로 처리 - likes 증가)
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '__like__', likes_increment: true }),
      });

      // 좋아요는 비밀번호 불필요하므로 클라이언트에서만 처리
      setPost((prev) => prev ? { ...prev, likes: prev.likes + 1 } : prev);
      setLiked(true);
    } catch {
      // 에러 무시
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!modalPassword.trim()) {
      setModalError('비밀번호를 입력해주세요.');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: modalPassword }),
      });

      const data = await res.json();

      if (!data.success) {
        setModalError(data.error || '삭제에 실패했습니다.');
        return;
      }

      router.push('/community');
    } catch {
      setModalError('서버 오류가 발생했습니다.');
    } finally {
      setModalLoading(false);
    }
  };

  // 게시글 수정 페이지로 이동 (비밀번호 확인 후)
  const handleEdit = async () => {
    if (!modalPassword.trim()) {
      setModalError('비밀번호를 입력해주세요.');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      // 비밀번호 확인용 PATCH (아무것도 수정하지 않음)
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: modalPassword, title: post?.title }),
      });

      const data = await res.json();

      if (!data.success) {
        setModalError(data.error || '비밀번호가 일치하지 않습니다.');
        return;
      }

      // 비밀번호 확인 성공 -> 현재 페이지에서 인라인 수정 모드 활성화
      setShowPasswordModal(null);
      setEditMode(true);
      setEditTitle(post?.title || '');
      setEditContent(post?.content || '');
      setEditPassword(modalPassword);
    } catch {
      setModalError('서버 오류가 발생했습니다.');
    } finally {
      setModalLoading(false);
    }
  };

  // 인라인 수정 상태
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setEditError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: editPassword,
          title: editTitle.trim(),
          content: editContent.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setEditError(data.error || '수정에 실패했습니다.');
        return;
      }

      setPost(data.post);
      setEditMode(false);
    } catch {
      setEditError('서버 오류가 발생했습니다.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              'w-8 h-8 border-3 border-primary/30 border-t-primary',
              'rounded-full animate-spin'
            )} />
            <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">
              로딩 중...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-32 text-gray-500 dark:text-dark-text-tertiary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-sm">{error || '게시글을 찾을 수 없습니다.'}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/community')}
            className="mt-4"
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.push('/community')}
        className={cn(
          'flex items-center gap-1 mb-4 text-sm',
          'text-gray-500 dark:text-dark-text-tertiary',
          'hover:text-gray-700 dark:hover:text-dark-text-secondary',
          'transition-colors duration-200'
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
        </svg>
        목록으로
      </button>

      {/* 게시글 본문 */}
      <Card variant="default" padding="lg">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={categoryBadgeVariant[post.category] || 'default'} size="md">
              {post.category}
            </Badge>
            {post.is_pinned && (
              <Badge variant="warning" size="sm">고정글</Badge>
            )}
          </div>

          {editMode ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={100}
              className={cn(
                'w-full px-3 py-2 text-lg font-bold rounded-lg',
                'bg-white dark:bg-dark-surface',
                'border border-gray-200 dark:border-dark-border',
                'text-gray-900 dark:text-dark-text',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                'transition-colors duration-200'
              )}
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">
              {post.title}
            </h1>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-dark-text-tertiary">
            <span className="font-medium text-gray-700 dark:text-dark-text-secondary">
              {post.nickname}
            </span>
            <span>{formatDate(post.created_at)}</span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                <path fillRule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.24.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.38 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
              </svg>
              {post.views}
            </span>
          </div>
        </div>

        {/* 본문 */}
        <div className={cn(
          'py-6 border-t border-b',
          'border-gray-100 dark:border-dark-border'
        )}>
          {editMode ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={5000}
                rows={15}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg resize-y',
                  'bg-white dark:bg-dark-surface',
                  'border border-gray-200 dark:border-dark-border',
                  'text-gray-900 dark:text-dark-text',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  'transition-colors duration-200'
                )}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-400">{editContent.length} / 5000</span>
              </div>
              {editError && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-2">{editError}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(false)}
                  type="button"
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={editLoading}
                  onClick={handleSaveEdit}
                >
                  수정 완료
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-dark-text-secondary whitespace-pre-wrap break-words leading-relaxed">
              {post.content}
            </div>
          )}
        </div>

        {/* 좋아요 + 액션 버튼 */}
        {!editMode && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleLike}
              disabled={liked}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                'border transition-all duration-200',
                liked
                  ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400'
                  : cn(
                      'border-gray-200 dark:border-dark-border',
                      'text-gray-500 dark:text-dark-text-tertiary',
                      'hover:border-red-300 hover:text-red-500',
                      'dark:hover:border-red-500/30 dark:hover:text-red-400'
                    )
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.723.723 0 0 1-.692 0h-.002Z" />
              </svg>
              <span className="font-medium">{post.likes}</span>
              <span>{liked ? '추천함' : '추천'}</span>
            </button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasswordModal('edit');
                  setModalPassword('');
                  setModalError('');
                }}
              >
                수정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasswordModal('delete');
                  setModalPassword('');
                  setModalError('');
                }}
                className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                삭제
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 댓글 섹션 */}
      <Card variant="default" padding="lg" className="mt-4">
        <CommentSection postId={postId} initialComments={comments} />
      </Card>

      {/* 비밀번호 확인 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(null)}
          />

          {/* 모달 */}
          <div className={cn(
            'relative w-full max-w-sm p-6 rounded-2xl',
            'bg-white dark:bg-dark-surface',
            'shadow-2xl',
            'border border-gray-200 dark:border-dark-border'
          )}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-2">
              {showPasswordModal === 'edit' ? '게시글 수정' : '게시글 삭제'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-4">
              {showPasswordModal === 'edit'
                ? '게시글을 수정하려면 비밀번호를 입력해주세요.'
                : '게시글을 삭제하려면 비밀번호를 입력해주세요. 이 작업은 되돌릴 수 없습니다.'}
            </p>

            <input
              type="password"
              placeholder="비밀번호"
              value={modalPassword}
              onChange={(e) => setModalPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  showPasswordModal === 'edit' ? handleEdit() : handleDelete();
                }
              }}
              autoFocus
              className={cn(
                'w-full px-3 py-2.5 text-sm rounded-lg',
                'bg-white dark:bg-dark-bg',
                'border border-gray-200 dark:border-dark-border',
                'text-gray-900 dark:text-dark-text',
                'placeholder-gray-400 dark:placeholder-dark-text-tertiary',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                'transition-colors duration-200'
              )}
            />

            {modalError && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-2">{modalError}</p>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowPasswordModal(null)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant={showPasswordModal === 'delete' ? 'secondary' : 'primary'}
                size="md"
                loading={modalLoading}
                onClick={showPasswordModal === 'edit' ? handleEdit : handleDelete}
                className={cn(
                  'flex-1',
                  showPasswordModal === 'delete' && 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                )}
              >
                {showPasswordModal === 'edit' ? '수정하기' : '삭제하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

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

interface CommentTree extends CommentData {
  replies: CommentTree[];
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentData[];
}

/**
 * 상대적 시간 포맷 (N분 전, N시간 전, N일 전)
 */
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * 평탄 댓글 목록을 트리 구조로 변환
 */
function buildCommentTree(comments: CommentData[]): CommentTree[] {
  const map = new Map<string, CommentTree>();
  const roots: CommentTree[] = [];

  // 모든 댓글을 맵에 넣기
  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  // 트리 구성
  comments.forEach((comment) => {
    const node = map.get(comment.id)!;
    if (comment.parent_id && map.has(comment.parent_id)) {
      map.get(comment.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * 댓글 입력 폼 컴포넌트
 */
const CommentForm: React.FC<{
  postId: string;
  parentId?: string | null;
  onSubmit: (comment: CommentData) => void;
  onCancel?: () => void;
  isReply?: boolean;
}> = ({ postId, parentId, onSubmit, onCancel, isReply = false }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim() || !password.trim() || !content.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          parent_id: parentId || null,
          nickname: nickname.trim(),
          password,
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || '댓글 작성에 실패했습니다.');
        return;
      }

      onSubmit(data.comment);
      setNickname('');
      setPassword('');
      setContent('');
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn(
      'space-y-3',
      isReply ? 'mt-3 ml-8 pl-4 border-l-2 border-[var(--border)]' : 'mt-6'
    )}>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          className={cn(
            'flex-1 px-3 py-2 text-sm rounded-lg',
            'border border-[var(--border)]',
            'text-[var(--text)]',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'transition-colors duration-200'
          )}
          style={{ backgroundColor: 'var(--surface)' }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={30}
          className={cn(
            'flex-1 px-3 py-2 text-sm rounded-lg',
            'border border-[var(--border)]',
            'text-[var(--text)]',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'transition-colors duration-200'
          )}
          style={{ backgroundColor: 'var(--surface)' }}
        />
      </div>
      <div className="flex gap-2">
        <textarea
          placeholder={isReply ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={isReply ? 2 : 3}
          className={cn(
            'flex-1 px-3 py-2 text-sm rounded-lg resize-none',
            'border border-[var(--border)]',
            'text-[var(--text)]',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'transition-colors duration-200'
          )}
          style={{ backgroundColor: 'var(--surface)' }}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} type="button">
            취소
          </Button>
        )}
        <Button variant="primary" size="sm" loading={loading} type="submit">
          {isReply ? '답글 작성' : '댓글 작성'}
        </Button>
      </div>
    </form>
  );
};

/**
 * 개별 댓글 컴포넌트
 */
const CommentItem: React.FC<{
  comment: CommentTree;
  postId: string;
  depth: number;
  onDelete: (commentId: string) => void;
  onReply: (comment: CommentData) => void;
}> = ({ comment, postId, depth, onDelete, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('비밀번호를 입력해주세요.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/community/comments/${comment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!data.success) {
        setDeleteError(data.error || '댓글 삭제에 실패했습니다.');
        return;
      }

      onDelete(comment.id);
    } catch {
      setDeleteError('서버 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySubmit = (newComment: CommentData) => {
    onReply(newComment);
    setShowReplyForm(false);
  };

  return (
    <div className={cn(
      depth > 0 && 'ml-8 pl-4 border-l-2 border-[var(--border)]'
    )}>
      <div className={cn(
        'py-3',
        depth === 0 && 'border-b border-[var(--border)]'
      )}>
        {/* 댓글 헤더 */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-medium text-[var(--text)]">
            {comment.nickname}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">
            {formatTimeAgo(comment.created_at)}
          </span>
        </div>

        {/* 댓글 내용 */}
        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-3 mt-2">
          {depth < 2 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-[var(--text-tertiary)] hover:text-primary dark:hover:text-primary-400 transition-colors"
            >
              답글
            </button>
          )}
          <button
            onClick={() => {
              setShowDeleteInput(!showDeleteInput);
              setDeleteError('');
              setDeletePassword('');
            }}
            className="text-xs text-[var(--text-tertiary)] hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            삭제
          </button>
        </div>

        {/* 삭제 비밀번호 입력 */}
        {showDeleteInput && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="password"
              placeholder="비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleDelete();
              }}
              className={cn(
                'px-2 py-1 text-xs rounded',
                'border border-[var(--border)]',
                'text-[var(--text)]',
                'focus:outline-none focus:ring-1 focus:ring-red-300',
                'transition-colors duration-200'
              )}
              style={{ backgroundColor: 'var(--surface)' }}
            />
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '확인'}
            </button>
            <button
              onClick={() => {
                setShowDeleteInput(false);
                setDeleteError('');
              }}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              취소
            </button>
            {deleteError && (
              <span className="text-xs text-red-500 dark:text-red-400">{deleteError}</span>
            )}
          </div>
        )}

        {/* 답글 폼 */}
        {showReplyForm && (
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReplyForm(false)}
            isReply
          />
        )}
      </div>

      {/* 대댓글 렌더링 */}
      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 댓글 섹션 메인 컴포넌트
 */
const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialComments }) => {
  const [comments, setComments] = useState<CommentData[]>(initialComments);

  const commentTree = buildCommentTree(comments);

  const handleNewComment = useCallback((newComment: CommentData) => {
    setComments((prev) => [...prev, newComment]);
  }, []);

  const handleDeleteComment = useCallback((commentId: string) => {
    setComments((prev) => prev.filter(
      (c) => c.id !== commentId && c.parent_id !== commentId
    ));
  }, []);

  return (
    <div className="mt-8">
      {/* 댓글 헤더 */}
      <h3 className={cn(
        'text-base font-bold mb-4 pb-2',
        'text-[var(--text)]',
        'border-b border-[var(--border)]',
        'flex items-center gap-2'
      )}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
        </svg>
        댓글 {comments.length}개
      </h3>

      {/* 댓글 목록 */}
      {commentTree.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
          아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
        </p>
      ) : (
        <div>
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              depth={0}
              onDelete={handleDeleteComment}
              onReply={handleNewComment}
            />
          ))}
        </div>
      )}

      {/* 새 댓글 작성 폼 */}
      <CommentForm
        postId={postId}
        onSubmit={handleNewComment}
      />
    </div>
  );
};

export default CommentSection;

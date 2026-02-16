'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { PostListItem } from '@/types/database';

interface PostCardProps {
  post: PostListItem;
  onClick?: () => void;
}

const categoryBadgeVariant: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  '자유': 'default' as 'info',
  '예측': 'primary',
  '후기': 'success',
  '팁': 'warning',
};

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
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 cursor-pointer',
        'border-b border-gray-100 dark:border-dark-border',
        'hover:bg-gray-50 dark:hover:bg-dark-surface-hover',
        'transition-colors duration-150'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* 고정 아이콘 */}
      {post.is_pinned && (
        <span className="flex-shrink-0 text-primary dark:text-primary-400" title="고정글">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
          </svg>
        </span>
      )}

      {/* 카테고리 배지 */}
      <Badge
        variant={categoryBadgeVariant[post.category] || 'default'}
        size="sm"
        className="flex-shrink-0"
      >
        {post.category}
      </Badge>

      {/* 제목 + 댓글 수 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'text-sm font-medium truncate',
            'text-gray-900 dark:text-dark-text',
            post.is_pinned && 'font-bold'
          )}>
            {post.title}
          </span>
          {post.comment_count > 0 && (
            <span className="text-xs text-primary dark:text-primary-400 font-bold flex-shrink-0">
              [{post.comment_count}]
            </span>
          )}
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500 dark:text-dark-text-tertiary">
        <span className="hidden sm:inline">{post.nickname}</span>
        <span className="flex items-center gap-0.5" title="조회수">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            <path fillRule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.24.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.38 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
          </svg>
          {post.views}
        </span>
        <span className="flex items-center gap-0.5" title="추천">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M2 6.342a3.375 3.375 0 0 1 6-2.088 3.375 3.375 0 0 1 5.997 2.26c-.063 2.134-1.618 3.76-2.955 4.784a14.437 14.437 0 0 1-2.676 1.61c-.02.01-.038.017-.05.022l-.014.006-.004.002h-.002a.75.75 0 0 1-.592.001h-.002l-.004-.003-.015-.006a5.528 5.528 0 0 1-.232-.107 14.395 14.395 0 0 1-2.494-1.519C3.614 10.28 2.065 8.657 2 6.342Z" />
          </svg>
          {post.likes}
        </span>
        <span className="hidden sm:inline">{formatTimeAgo(post.created_at)}</span>
      </div>
    </div>
  );
};

export default PostCard;

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import PostCard from '@/components/community/PostCard';
import type { PostListItem } from '@/types/database';

const CATEGORY_TABS = [
  { id: 'all', label: '전체' },
  { id: '자유', label: '자유' },
  { id: '예측', label: '예측' },
  { id: '후기', label: '후기' },
  { id: '팁', label: '팁' },
];

const SORT_OPTIONS = [
  { id: 'latest', label: '최신순' },
  { id: 'popular', label: '인기순' },
  { id: 'likes', label: '추천순' },
];

export default function CommunityPage() {
  const router = useRouter();
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<PostListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      params.set('page', String(page));
      params.set('limit', '20');
      params.set('sort', sort);

      const res = await fetch(`/api/community/posts?${params}`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts);
        setPinnedPosts(data.pinnedPosts || []);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [category, sort, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 카테고리나 정렬 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [category, sort]);

  const handlePostClick = (postId: string) => {
    router.push(`/community/${postId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 페이지 제목 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            커뮤니티
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            로또에 대한 이야기를 나눠보세요
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push('/community/write')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          }
        >
          글쓰기
        </Button>
      </div>

      {/* 카테고리 탭 */}
      <div className="mb-4">
        <Tabs
          tabs={CATEGORY_TABS}
          activeTab={category}
          onChange={setCategory}
          variant="pills"
        />
      </div>

      {/* 정렬 옵션 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          총 {total}개의 글
        </span>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSort(option.id)}
              className="px-3 py-1 text-xs rounded-full transition-colors duration-200"
              style={{
                backgroundColor: sort === option.id ? 'var(--text)' : 'transparent',
                color: sort === option.id ? 'var(--bg)' : 'var(--text-tertiary)',
                fontWeight: sort === option.id ? 600 : 400,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 게시글 목록 */}
      <Card variant="default" padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                'w-8 h-8 border-3 border-primary/30 border-t-primary',
                'rounded-full animate-spin'
              )} />
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                로딩 중...
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* 고정글 */}
            {pinnedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post.id)}
              />
            ))}

            {/* 일반 게시글 */}
            {posts.length === 0 && pinnedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-tertiary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <p className="text-sm">아직 게시글이 없습니다.</p>
                <p className="text-xs mt-1">첫 글을 작성해보세요!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => handlePostClick(post.id)}
                />
              ))
            )}
          </>
        )}
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>

          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            // 현재 페이지 중심으로 표시
            let pageNum: number;
            if (totalPages <= 10) {
              pageNum = i + 1;
            } else if (page <= 5) {
              pageNum = i + 1;
            } else if (page >= totalPages - 4) {
              pageNum = totalPages - 9 + i;
            } else {
              pageNum = page - 4 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className="w-8 h-8 text-sm rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: page === pageNum ? 'var(--primary)' : 'transparent',
                  color: page === pageNum ? '#fff' : 'var(--text-secondary)',
                  fontWeight: page === pageNum ? 700 : 400,
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}

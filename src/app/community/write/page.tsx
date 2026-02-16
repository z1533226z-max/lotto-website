'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { PostCategory } from '@/types/database';

const CATEGORIES: { id: PostCategory; label: string; description: string }[] = [
  { id: '자유', label: '자유', description: '자유롭게 이야기해요' },
  { id: '예측', label: '예측', description: '번호 예측을 공유해요' },
  { id: '후기', label: '후기', description: '당첨 후기를 남겨요' },
  { id: '팁', label: '팁', description: '분석 팁을 공유해요' },
];

const MAX_CONTENT_LENGTH = 5000;

export default function CommunityWritePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<PostCategory | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 허니팟 체크 (스팸 봇 방지)
    if (honeypot) {
      // 봇이 숨겨진 필드를 채운 경우 -> 조용히 성공처럼 보이게
      router.push('/community');
      return;
    }

    // 유효성 검사
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (!category) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`내용은 ${MAX_CONTENT_LENGTH}자까지 입력할 수 있습니다.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          password,
          title: title.trim(),
          content: content.trim(),
          category,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || '게시글 작성에 실패했습니다.');
        return;
      }

      // 작성 성공 -> 해당 게시글로 이동
      router.push(`/community/${data.post.id}`);
    } catch {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 페이지 제목 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
          글쓰기
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-1">
          커뮤니티에 새 글을 작성합니다
        </p>
      </div>

      <Card variant="default" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 닉네임 & 비밀번호 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1.5">
                닉네임
              </label>
              <input
                type="text"
                placeholder="닉네임 (2~20자)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className={cn(
                  'w-full px-3 py-2.5 text-sm rounded-lg',
                  'bg-white dark:bg-dark-surface',
                  'border border-gray-200 dark:border-dark-border',
                  'text-gray-900 dark:text-dark-text',
                  'placeholder-gray-400 dark:placeholder-dark-text-tertiary',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  'transition-colors duration-200'
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호 (4~30자, 수정/삭제 시 필요)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={30}
                className={cn(
                  'w-full px-3 py-2.5 text-sm rounded-lg',
                  'bg-white dark:bg-dark-surface',
                  'border border-gray-200 dark:border-dark-border',
                  'text-gray-900 dark:text-dark-text',
                  'placeholder-gray-400 dark:placeholder-dark-text-tertiary',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  'transition-colors duration-200'
                )}
              />
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1.5">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg transition-all duration-200',
                    'border',
                    category === cat.id
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : cn(
                          'bg-white dark:bg-dark-surface',
                          'border-gray-200 dark:border-dark-border',
                          'text-gray-600 dark:text-dark-text-secondary',
                          'hover:border-primary/50 hover:text-primary dark:hover:text-primary-400'
                        )
                  )}
                >
                  <span className="font-medium">{cat.label}</span>
                  <span className={cn(
                    'block text-xs mt-0.5',
                    category === cat.id
                      ? 'text-white/80'
                      : 'text-gray-400 dark:text-dark-text-tertiary'
                  )}>
                    {cat.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1.5">
              제목
            </label>
            <input
              type="text"
              placeholder="제목을 입력하세요 (2~100자)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className={cn(
                'w-full px-3 py-2.5 text-sm rounded-lg',
                'bg-white dark:bg-dark-surface',
                'border border-gray-200 dark:border-dark-border',
                'text-gray-900 dark:text-dark-text',
                'placeholder-gray-400 dark:placeholder-dark-text-tertiary',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                'transition-colors duration-200'
              )}
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1.5">
              내용
            </label>
            <textarea
              placeholder="내용을 입력하세요 (5~5000자)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CONTENT_LENGTH}
              rows={12}
              className={cn(
                'w-full px-3 py-2.5 text-sm rounded-lg resize-y',
                'bg-white dark:bg-dark-surface',
                'border border-gray-200 dark:border-dark-border',
                'text-gray-900 dark:text-dark-text',
                'placeholder-gray-400 dark:placeholder-dark-text-tertiary',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                'transition-colors duration-200'
              )}
            />
            <div className="flex justify-end mt-1">
              <span className={cn(
                'text-xs',
                content.length > MAX_CONTENT_LENGTH * 0.9
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-gray-400 dark:text-dark-text-tertiary'
              )}>
                {content.length} / {MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          {/* 허니팟 (스팸 방지 - 숨겨진 필드) */}
          <div className="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className={cn(
              'px-4 py-3 rounded-lg text-sm',
              'bg-red-50 dark:bg-red-500/10',
              'text-red-600 dark:text-red-400',
              'border border-red-200 dark:border-red-500/30'
            )}>
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
              type="button"
              className="flex-1 sm:flex-none"
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              type="submit"
              className="flex-1 sm:flex-none"
            >
              작성하기
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

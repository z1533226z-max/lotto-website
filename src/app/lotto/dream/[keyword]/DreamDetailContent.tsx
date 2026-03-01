'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import type { DreamKeyword } from '@/data/dreamNumbers';

interface Props {
  dream: DreamKeyword;
  sameCategoryDreams: DreamKeyword[];
  allDreams: DreamKeyword[];
  categories: string[];
}

const categoryEmoji: Record<string, string> = {
  '동물': '🐾',
  '자연': '🌿',
  '사물': '📦',
  '행동': '🏃',
  '감정': '💭',
  '사람': '👤',
  '색깔': '🎨',
};

export default function DreamDetailContent({ dream, sameCategoryDreams, allDreams, categories }: Props) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{categoryEmoji[dream.category] || '✨'}</div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {dream.keyword} 꿈해몽 로또번호
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-2">
          {dream.category} | 꿈해몽 번호 추천
        </p>
      </div>

      {/* 추천 번호 */}
      <div className="rounded-xl p-8 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">🎱 추천 로또번호</h2>
        <div className="flex justify-center mb-4">
          <LottoNumbers numbers={dream.numbers} size="lg" animated />
        </div>
        <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          {dream.keyword} 꿈에서 추천하는 번호입니다
        </p>
      </div>

      {/* 꿈해몽 설명 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📖 {dream.keyword} 꿈해몽</h2>
        <p className="leading-relaxed">{dream.description}</p>
        <div className="mt-4 flex gap-2">
          <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--border)' }}>
            {categoryEmoji[dream.category]} {dream.category}
          </span>
          {dream.numbers.map(n => (
            <Link
              key={n}
              href={`/lotto/number/${n}`}
              className="px-3 py-1 rounded-full text-sm hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#D36135', color: '#fff' }}
            >
              {n}번 분석
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">❓ 자주 묻는 질문</h2>
        <div className="space-y-4">
          <FaqItem
            q={`${dream.keyword} 꿈을 꾸면 로또번호는?`}
            a={`${dream.keyword} 꿈의 추천 로또번호는 ${dream.numbers.join(', ')}입니다. ${dream.description}`}
          />
          <FaqItem
            q={`${dream.keyword} 꿈은 무슨 뜻인가요?`}
            a={dream.description}
          />
          <FaqItem
            q={`${dream.keyword} 꿈은 길몽인가요?`}
            a={`${dream.keyword} 꿈은 ${dream.category} 카테고리에 속하며, ${dream.description}`}
          />
        </div>
      </div>

      {/* 같은 카테고리 */}
      {sameCategoryDreams.length > 0 && (
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold mb-4">
            {categoryEmoji[dream.category]} 같은 카테고리: {dream.category}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sameCategoryDreams.map(d => (
              <Link
                key={d.keyword}
                href={`/lotto/dream/${encodeURIComponent(d.keyword)}`}
                className="p-3 rounded-lg hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <div className="font-semibold mb-1">{d.keyword}</div>
                <div className="flex gap-1">
                  <LottoNumbers numbers={d.numbers} size="xs" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 전체 카테고리 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📂 전체 꿈해몽 카테고리</h2>
        {categories.map(cat => {
          const catDreams = allDreams.filter(d => d.category === cat);
          return (
            <div key={cat} className="mb-4">
              <h3 className="font-semibold mb-2">{categoryEmoji[cat]} {cat} ({catDreams.length}개)</h3>
              <div className="flex flex-wrap gap-2">
                {catDreams.map(d => (
                  <Link
                    key={d.keyword}
                    href={`/lotto/dream/${encodeURIComponent(d.keyword)}`}
                    className={`px-3 py-1 rounded-full text-sm transition-all hover:scale-105 ${d.keyword === dream.keyword ? 'font-bold' : ''}`}
                    style={{
                      backgroundColor: d.keyword === dream.keyword ? '#D36135' : 'var(--border)',
                      color: d.keyword === dream.keyword ? '#fff' : 'var(--text)',
                    }}
                  >
                    {d.keyword}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>
      <h3 className="font-semibold mb-1">{q}</h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a}</p>
    </div>
  );
}

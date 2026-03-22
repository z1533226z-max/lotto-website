import Link from 'next/link';
import { DREAM_KEYWORDS, DREAM_CATEGORIES } from '@/data/dreamNumbers';

/**
 * 공개 크롤 허브 — 'use client' 없음, 서버 컴포넌트
 * MemberGate 바깥에 배치하여 구글봇이 62개 키워드 링크를 크롤할 수 있게 합니다.
 */
export default function DreamLinkHub() {
  const categories = DREAM_CATEGORIES.filter((c) => c !== '전체');

  return (
    <section aria-label="꿈해몽 키워드 목록" className="mb-8">
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
        꿈해몽 키워드
      </h2>
      <div className="space-y-5">
        {categories.map((cat) => {
          const keywords = DREAM_KEYWORDS.filter((k) => k.category === cat);
          if (keywords.length === 0) return null;
          return (
            <div key={cat}>
              <h3
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <Link
                    key={kw.keyword}
                    href={`/lotto/dream/${encodeURIComponent(kw.keyword)}`}
                    className="inline-block px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {kw.keyword}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

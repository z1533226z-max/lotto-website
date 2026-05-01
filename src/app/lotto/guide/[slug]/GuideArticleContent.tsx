'use client';

import Link from 'next/link';
import SectionFrame from '@/components/ui/SectionFrame';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { GuideArticle } from '@/data/guideArticles';

interface Props {
  article: GuideArticle;
  relatedArticles: GuideArticle[];
}

const CATEGORY_BADGE: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  '\uAD6C\uB9E4': 'primary',
  '\uB2F9\uCCA8': 'success',
  '\uC804\uB7B5': 'warning',
  '\uC815\uBCF4': 'info',
};

export default function GuideArticleContent({ article, relatedArticles }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <SectionFrame
        eyebrow={`\uB85C\uB610 \uAC00\uC774\uB4DC \xB7 ${article.category}`}
        title={article.title}
        subtitle={article.metaDescription}
        size="sm"
        animate={false}
        maxWidth="full"
        headingLevel={1}
        className="px-0"
      >
        <div />
      </SectionFrame>

      {/* Table of Contents */}
      <Card variant="glass" padding="md" className="mb-8">
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text)' }}
        >
          \uBAA9\uCC28
        </p>
        <div className="flex flex-wrap gap-2">
          {article.sections.map((section, i) => (
            <a
              key={i}
              href={`#section-${i}`}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium',
                'transition-all duration-200',
                'hover:-translate-y-0.5',
              )}
              style={{
                backgroundColor: 'var(--surface-hover)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {section.heading}
            </a>
          ))}
          <a
            href="#faq"
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium',
              'transition-all duration-200',
              'hover:-translate-y-0.5',
            )}
            style={{
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            FAQ
          </a>
        </div>
      </Card>

      {/* Content Sections */}
      {article.sections.map((section, i) => (
        <section key={i} id={`section-${i}`} className="scroll-mt-20">
          <Card variant="default" padding="lg" className="mb-6">
            <div
              className="flex items-center gap-3 mb-4 pb-3"
              style={{ borderBottom: '2px solid var(--border-light)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                }}
              >
                <span>{article.icon}</span>
              </div>
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                {section.heading}
              </h2>
            </div>
            <p
              className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
              style={{ color: 'var(--text-secondary)' }}
            >
              {section.content}
            </p>
          </Card>
        </section>
      ))}

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-20">
        <Card variant="default" padding="lg" className="mb-6">
          <div
            className="flex items-center gap-3 mb-4 pb-3"
            style={{ borderBottom: '2px solid var(--border-light)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}
            >
              <span>{'\u2753'}</span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{ color: 'var(--text)' }}
            >
              {'\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38'}
            </h2>
          </div>
          <div className="space-y-3">
            {article.faqs.map((faq, i) => (
              <details
                key={i}
                className={cn(
                  'group rounded-xl transition-all duration-200',
                  'border',
                )}
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                }}
                open={i === 0}
              >
                <summary
                  className={cn(
                    'flex items-center justify-between cursor-pointer',
                    'px-5 py-4 font-semibold text-sm sm:text-base',
                    'select-none list-none',
                    '[&::-webkit-details-marker]:hidden',
                  )}
                  style={{ color: 'var(--text)' }}
                >
                  <span>{faq.question}</span>
                  <svg
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                      'group-open:rotate-180',
                    )}
                    style={{ color: 'var(--text-tertiary)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div
                  className="px-5 pb-4 text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </Card>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <Card variant="default" padding="lg" className="mb-6">
          <h2
            className="text-lg font-bold mb-4"
            style={{ color: 'var(--text)' }}
          >
            {'\uAD00\uB828 \uAC00\uC774\uB4DC'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relatedArticles.map(related => (
              <Link
                key={related.slug}
                href={`/lotto/guide/${related.slug}`}
                className={cn(
                  'rounded-xl p-4 transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-md',
                )}
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{related.icon}</span>
                  <Badge
                    variant={CATEGORY_BADGE[related.category] || 'info'}
                    size="sm"
                  >
                    {related.category}
                  </Badge>
                </div>
                <p
                  className="text-sm font-semibold line-clamp-2"
                  style={{ color: 'var(--text)' }}
                >
                  {related.title}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Back to Guide Hub */}
      <div className="text-center mb-8">
        <Link
          href="/lotto/guide"
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
            'text-sm font-semibold',
            'transition-all duration-200',
            'hover:-translate-y-0.5',
          )}
          style={{
            backgroundColor: 'var(--surface-hover)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          {'\u2190 \uB85C\uB610 \uAC00\uC774\uB4DC \uBAA9\uB85D\uC73C\uB85C'}
        </Link>
      </div>
    </div>
  );
}

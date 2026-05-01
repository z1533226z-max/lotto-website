import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { GUIDE_ARTICLES, getGuideArticle, getAllGuideSlugs } from '@/data/guideArticles';
import GuideArticleContent from './GuideArticleContent';

interface Props {
  params: { slug: string };
}

export const revalidate = 86400; // 24h

export function generateStaticParams() {
  return getAllGuideSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getGuideArticle(params.slug);
  if (!article) return { title: '가이드 | 로또킹' };

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: {
      canonical: `/lotto/guide/${article.slug}`,
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `https://lotto.gon.ai.kr/lotto/guide/${article.slug}`,
    },
  };
}

export default function GuideArticlePage({ params }: Props) {
  const article = getGuideArticle(params.slug);
  if (!article) notFound();

  const relatedArticles = article.relatedSlugs
    .map(s => GUIDE_ARTICLES.find(a => a.slug === s))
    .filter(Boolean) as typeof GUIDE_ARTICLES;

  // FAQPage JSON-LD - content is from static data file, not user input
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Article JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    url: `https://lotto.gon.ai.kr/lotto/guide/${article.slug}`,
    publisher: {
      '@type': 'Organization',
      name: '\uB85C\uB610\uD0B9',
      url: 'https://lotto.gon.ai.kr',
    },
  };

  return (
    <>
      {/* JSON-LD structured data - static content from guideArticles.ts, safe from XSS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Breadcrumb
        items={[
          { label: '\uD648', href: '/' },
          { label: '\uB85C\uB610 \uAC00\uC774\uB4DC', href: '/lotto/guide' },
          { label: article.title },
        ]}
      />
      <GuideArticleContent article={article} relatedArticles={relatedArticles} />
    </>
  );
}

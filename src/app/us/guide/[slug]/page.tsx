import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  US_GUIDE_ARTICLES,
  getUsGuide,
  getAllUsGuideSlugs,
} from '@/data/usGuideArticles';

interface Props {
  params: { slug: string };
}

export const revalidate = 86400;

export function generateStaticParams() {
  return getAllUsGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getUsGuide(params.slug);
  if (!article) return { title: 'US Lottery Guide' };

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `/us/guide/${article.slug}` },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `https://lotto.gon.ai.kr/us/guide/${article.slug}`,
      type: 'article',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
    },
  };
}

export default function UsGuideArticlePage({ params }: Props) {
  const article = getUsGuide(params.slug);
  if (!article) notFound();

  const related = article.relatedSlugs
    .map((s) => US_GUIDE_ARTICLES.find((a) => a.slug === s))
    .filter(Boolean) as typeof US_GUIDE_ARTICLES;

  // JSON-LD payloads — content sourced entirely from /src/data/usGuideArticles.ts (static, no user input). Safe from XSS.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    url: `https://lotto.gon.ai.kr/us/guide/${article.slug}`,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Lotto.Gon US',
      url: 'https://lotto.gon.ai.kr/us',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'US Lottery Hub', item: 'https://lotto.gon.ai.kr/us' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://lotto.gon.ai.kr/us/guide' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://lotto.gon.ai.kr/us/guide/${article.slug}` },
    ],
  };

  return (
    <>
      {/* Structured data — sourced from static /src/data/usGuideArticles.ts. Safe. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/us" className="hover:text-orange-600">
          US Hub
        </Link>
        <span aria-hidden> / </span>
        <Link href="/us/guide" className="hover:text-orange-600">
          Guides
        </Link>
        <span aria-hidden> / </span>
        <span className="text-gray-700 dark:text-gray-200">{article.category}</span>
      </nav>

      <article className="prose prose-gray max-w-none dark:prose-invert">
        <h1>{article.title}</h1>
        <p className="lead">{article.metaDescription}</p>

        <nav className="not-prose my-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Contents</p>
          <ul className="space-y-1">
            {article.sections.map((s, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="text-orange-600 hover:underline dark:text-orange-400"
                >
                  {s.heading}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#faq"
                className="text-orange-600 hover:underline dark:text-orange-400"
              >
                Frequently Asked Questions
              </a>
            </li>
          </ul>
        </nav>

        {article.sections.map((section, i) => (
          <section key={i} id={`section-${i}`} className="scroll-mt-20">
            <h2>{section.heading}</h2>
            <p>{section.content}</p>
          </section>
        ))}

        <section id="faq" className="scroll-mt-20">
          <h2>Frequently Asked Questions</h2>
          {article.faqs.map((f, i) => (
            <div key={i}>
              <h3>{f.question}</h3>
              <p>{f.answer}</p>
            </div>
          ))}
        </section>

        <hr />

        {related.length > 0 && (
          <section className="not-prose">
            <h2 className="text-xl font-semibold">Related guides</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/us/guide/${r.slug}`}
                  className="block rounded-lg border border-gray-200 p-4 transition hover:border-orange-500 dark:border-gray-800"
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                    {r.category}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {r.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/us/guide"
            className="rounded-md border border-gray-300 px-3 py-1.5 font-medium hover:border-orange-500 dark:border-gray-700"
          >
            ← All guides
          </Link>
          {article.game !== 'mega-millions' && (
            <Link
              href="/us/powerball"
              className="rounded-md border border-gray-300 px-3 py-1.5 font-medium hover:border-orange-500 dark:border-gray-700"
            >
              Powerball overview
            </Link>
          )}
          {article.game !== 'powerball' && (
            <Link
              href="/us/mega-millions"
              className="rounded-md border border-gray-300 px-3 py-1.5 font-medium hover:border-orange-500 dark:border-gray-700"
            >
              Mega Millions overview
            </Link>
          )}
        </div>
      </article>
    </>
  );
}

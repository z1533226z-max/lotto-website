import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DREAM_KEYWORDS } from '@/data/dreamNumbers';
import Breadcrumb from '@/components/layout/Breadcrumb';
import DreamDetailContent from './DreamDetailContent';

interface Props {
  params: { keyword: string };
}

export const revalidate = 3600;

export function generateStaticParams() {
  return DREAM_KEYWORDS.map(d => ({ keyword: encodeURIComponent(d.keyword) }));
}

function findDream(keyword: string) {
  const decoded = decodeURIComponent(keyword);
  return DREAM_KEYWORDS.find(d => d.keyword === decoded);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dream = findDream(params.keyword);
  if (!dream) {
    return { title: '꿈해몽 번호 | 로또킹' };
  }

  const numbersStr = dream.numbers.join(', ');
  const title = `${dream.keyword} 꿈해몽 로또번호 - ${numbersStr} | 로또킹`;
  const description = `꿈에 ${dream.keyword}이(가) 나왔다면? 추천 로또번호: ${numbersStr}. ${dream.description} ${dream.category} 카테고리의 꿈해몽 로또번호를 확인하세요.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/lotto/dream/${encodeURIComponent(dream.keyword)}`,
    },
    openGraph: {
      title: `${dream.keyword} 꿈해몽 로또번호`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/dream/${encodeURIComponent(dream.keyword)}`,
    },
  };
}

export default function DreamDetailPage({ params }: Props) {
  const dream = findDream(params.keyword);
  if (!dream) {
    notFound();
  }

  // 같은 카테고리의 다른 꿈
  const sameCategoryDreams = DREAM_KEYWORDS
    .filter(d => d.category === dream.category && d.keyword !== dream.keyword);

  // 전체 카테고리 목록
  const categories = Array.from(new Set(DREAM_KEYWORDS.map(d => d.category)));

  // JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${dream.keyword} 꿈을 꾸면 로또번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${dream.keyword} 꿈의 추천 로또번호는 ${dream.numbers.join(', ')}입니다. ${dream.description}`,
        },
      },
      {
        '@type': 'Question',
        name: `${dream.keyword} 꿈은 무슨 뜻인가요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: dream.interpretation,
        },
      },
      {
        '@type': 'Question',
        name: `${dream.keyword} 꿈은 길몽인가요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${dream.keyword} 꿈의 길흉 판단은 "${dream.fortune}"입니다. ${dream.category} 카테고리에 속하며, ${dream.description}`,
        },
      },
      {
        '@type': 'Question',
        name: `${dream.keyword} 꿈에서 추천 번호를 조합하는 방법은?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `추천번호 ${dream.numbers.join(', ')}을 기본으로, 같은 ${dream.category} 카테고리의 다른 꿈 번호와 조합하면 효과적입니다. 여러 꿈을 꾸었다면 각 꿈의 번호를 모아 6개를 선택해 보세요.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '꿈번호', href: '/lotto/dream' },
        { label: dream.keyword },
      ]} />

      <DreamDetailContent
        dream={dream}
        sameCategoryDreams={sameCategoryDreams}
        allDreams={DREAM_KEYWORDS}
        categories={categories}
      />
    </>
  );
}

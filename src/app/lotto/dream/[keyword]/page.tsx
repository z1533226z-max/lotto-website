import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DREAM_KEYWORDS, type DreamKeyword } from '@/data/dreamNumbers';
import { getAllLottoData } from '@/lib/dataFetcher';
import { getFreshLinkData } from '@/lib/freshLinks';
import { DEFAULT_OG_IMAGES } from '@/lib/seo';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { FreshLinksProvider } from '@/components/lotto/CrossSectionLinks';
import DreamDetailContent, { type DreamView } from './DreamDetailContent';

interface Props {
  params: { keyword: string };
}

export const revalidate = 3600;

// 한글 키워드는 인코딩하지 않은 원문으로 넘긴다. encodeURIComponent 값을 넘기면 빌드 때 경로가 이중 인코딩돼
// 정적 생성 결과가 '없는 꿈'(notFound)으로 굳는다 — 운영에서 247개 상세가 모두 "꿈해몽 번호 | 로또킹" 빈 페이지였음.
export function generateStaticParams() {
  return DREAM_KEYWORDS.map(d => ({ keyword: d.keyword }));
}

/** params는 빌드/런타임에 따라 원문 또는 %인코딩 문자열로 들어오므로, 더 풀리지 않을 때까지 디코딩하며 찾는다 */
function findDream(keyword: string): DreamKeyword | undefined {
  let candidate = keyword;
  for (let i = 0; i < 3; i++) {
    const found = DREAM_KEYWORDS.find(d => d.keyword === candidate);
    if (found) return found;
    let decoded: string;
    try {
      decoded = decodeURIComponent(candidate);
    } catch {
      return undefined;
    }
    if (decoded === candidate) return undefined;
    candidate = decoded;
  }
  return undefined;
}

/** 클라이언트 컴포넌트로 넘길 필드만 (metaTitle·metaDescription 등 화면에 안 쓰는 필드 제외) */
function toDreamView(d: DreamKeyword): DreamView {
  return {
    keyword: d.keyword,
    numbers: d.numbers,
    category: d.category,
    description: d.description,
    interpretation: d.interpretation,
    numberReason: d.numberReason,
    fortune: d.fortune,
    situations: d.situations,
    extraFaq: d.extraFaq,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dream = findDream(params.keyword);
  if (!dream) {
    return { title: '꿈해몽 번호 | 로또킹' };
  }

  const numbersStr = dream.numbers.join(', ');
  const title = dream.metaTitle ?? `${dream.keyword} 꿈해몽 로또번호 - ${numbersStr} | 로또킹`;
  const description = dream.metaDescription ?? `꿈에 ${dream.keyword}이(가) 나왔다면? 추천 로또번호: ${numbersStr}. ${dream.description} ${dream.category} 카테고리의 꿈해몽 로또번호를 확인하세요.`;

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
      images: DEFAULT_OG_IMAGES,
    },
  };
}

export default async function DreamDetailPage({ params }: Props) {
  const dream = findDream(params.keyword);
  if (!dream) {
    notFound();
  }

  const allData = await getAllLottoData();

  // 클라이언트 컴포넌트 props는 HTML(RSC 페이로드)에 그대로 실리므로 화면에 쓰는 필드만 넘긴다.
  // (이전: 247개 꿈 객체 전체(해몽 본문 포함)를 넘겨 상세 페이지 HTML이 약 545KB)

  // 같은 카테고리의 다른 꿈
  const sameCategoryDreams = DREAM_KEYWORDS
    .filter(d => d.category === dream.category && d.keyword !== dream.keyword)
    .map(d => ({ keyword: d.keyword, numbers: d.numbers }));

  // 상황별 심화 풀이가 있는 고가치 꿈 (검색 수요 검증됨, 현재 페이지 제외)
  // — 카테고리를 넘나드는 크로스링크 클러스터로 PageRank를 집중시킨다
  const featuredDreams = DREAM_KEYWORDS
    .filter(d => d.situations && d.situations.length > 0 && d.keyword !== dream.keyword)
    .map(d => ({ keyword: d.keyword, category: d.category, numbers: d.numbers }));

  // 전체 카테고리별 키워드 (링크에 쓰는 키워드 문자열만)
  const categoryGroups = Array.from(new Set(DREAM_KEYWORDS.map(d => d.category))).map(category => ({
    category,
    keywords: DREAM_KEYWORDS.filter(d => d.category === category).map(d => d.keyword),
  }));

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
      ...(dream.extraFaq ?? []).map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
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

      <FreshLinksProvider value={getFreshLinkData(allData)}>
        <DreamDetailContent
          dream={toDreamView(dream)}
          sameCategoryDreams={sameCategoryDreams}
          featuredDreams={featuredDreams}
          categoryGroups={categoryGroups}
        />
      </FreshLinksProvider>
    </>
  );
}

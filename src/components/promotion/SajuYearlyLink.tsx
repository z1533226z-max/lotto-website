/**
 * 운세형 페이지 하단의 짧은 텍스트 링크 1개 → 사주명리(saju.gon.ai.kr) 띠별 연간 운세.
 * 띠를 알 수 있으면 /yearly/{띠}/, 모르면 /yearly/ 목록으로 보낸다.
 * (훅·브라우저 API를 쓰지 않으므로 서버/클라이언트 컴포넌트 어디서나 사용 가능)
 */

/** 띠 key → 사주명리 URL slug (양띠만 slug가 goat, 2026-10-05 12개 모두 200 확인) */
const ANIMALS = {
  rat: { name: '쥐', slug: 'rat' },
  ox: { name: '소', slug: 'ox' },
  tiger: { name: '호랑이', slug: 'tiger' },
  rabbit: { name: '토끼', slug: 'rabbit' },
  dragon: { name: '용', slug: 'dragon' },
  snake: { name: '뱀', slug: 'snake' },
  horse: { name: '말', slug: 'horse' },
  sheep: { name: '양', slug: 'goat' },
  monkey: { name: '원숭이', slug: 'monkey' },
  rooster: { name: '닭', slug: 'rooster' },
  dog: { name: '개', slug: 'dog' },
  pig: { name: '돼지', slug: 'pig' },
} as const;

export type SajuAnimalKey = keyof typeof ANIMALS;

const SAJU_YEARLY_URL = 'https://saju.gon.ai.kr/yearly/';

/** 한글 띠 이름(쥐·소·…·돼지) → key. 해당 없으면 undefined */
export function animalKeyFromKoreanName(name: string): SajuAnimalKey | undefined {
  return (Object.keys(ANIMALS) as SajuAnimalKey[]).find((k) => ANIMALS[k].name === name);
}

interface Props {
  animal?: SajuAnimalKey;
  className?: string;
}

export default function SajuYearlyLink({ animal, className }: Props) {
  const info = animal ? ANIMALS[animal] : undefined;
  const href = info ? `${SAJU_YEARLY_URL}${info.slug}/` : SAJU_YEARLY_URL;
  const label = info ? `${info.name}띠 올해·내년 운세 보기` : '띠별 올해·내년 운세 보기';

  return (
    <p className={className ?? 'text-sm text-center'} style={{ color: 'var(--text-secondary)' }}>
      <a
        href={href}
        className="font-medium underline underline-offset-2"
        style={{ color: 'var(--primary, #D36135)' }}
      >
        {label}
      </a>
      <span> · 사주명리</span>
    </p>
  );
}

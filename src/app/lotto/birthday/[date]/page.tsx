import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLottoData } from '@/lib/dataFetcher';
import { LottoStatisticsAnalyzer } from '@/lib/statisticsAnalyzer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import BirthdayContent from './BirthdayContent';

interface Props {
  params: { date: string };
}

export const revalidate = 86400; // 24시간 (정적 콘텐츠)

// --- 별자리 데이터 ---
const ZODIAC_SIGNS = [
  { name: '염소자리', emoji: '♑', start: [1, 1], end: [1, 19], element: '흙', trait: '성실하고 책임감이 강한' },
  { name: '물병자리', emoji: '♒', start: [1, 20], end: [2, 18], element: '공기', trait: '독창적이고 자유로운' },
  { name: '물고기자리', emoji: '♓', start: [2, 19], end: [3, 20], element: '물', trait: '감성이 풍부하고 직감이 뛰어난' },
  { name: '양자리', emoji: '♈', start: [3, 21], end: [4, 19], element: '불', trait: '열정적이고 도전적인' },
  { name: '황소자리', emoji: '♉', start: [4, 20], end: [5, 20], element: '흙', trait: '끈기 있고 안정적인' },
  { name: '쌍둥이자리', emoji: '♊', start: [5, 21], end: [6, 21], element: '공기', trait: '재치 있고 다재다능한' },
  { name: '게자리', emoji: '♋', start: [6, 22], end: [7, 22], element: '물', trait: '따뜻하고 가정적인' },
  { name: '사자자리', emoji: '♌', start: [7, 23], end: [8, 22], element: '불', trait: '당당하고 리더십이 있는' },
  { name: '처녀자리', emoji: '♍', start: [8, 23], end: [9, 22], element: '흙', trait: '분석적이고 완벽주의적인' },
  { name: '천칭자리', emoji: '♎', start: [9, 23], end: [10, 22], element: '공기', trait: '균형감각이 뛰어나고 조화로운' },
  { name: '전갈자리', emoji: '♏', start: [10, 23], end: [11, 21], element: '물', trait: '통찰력이 깊고 열정적인' },
  { name: '사수자리', emoji: '♐', start: [11, 22], end: [12, 21], element: '불', trait: '모험을 즐기고 낙천적인' },
  { name: '염소자리', emoji: '♑', start: [12, 22], end: [12, 31], element: '흙', trait: '성실하고 책임감이 강한' },
];

function getZodiac(month: number, day: number) {
  for (const z of ZODIAC_SIGNS) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm === em) {
      if (month === sm && day >= sd && day <= ed) return z;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
    }
  }
  return ZODIAC_SIGNS[0]; // fallback
}

// --- 결정론적 번호 생성 (fortune 페이지와 동일 알고리즘) ---
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateNumbers(seed: number): number[] {
  const rng = seededRandom(seed);
  const numbers: Set<number> = new Set();
  while (numbers.size < 6) {
    numbers.add(Math.floor(rng() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// --- 날짜 파싱 ---
function parseBirthdayDate(date: string): { month: number; day: number } | null {
  const m = date.match(/^(\d{2})-(\d{2})$/);
  if (!m) return null;
  const month = parseInt(m[1]);
  const day = parseInt(m[2]);
  if (month < 1 || month > 12) return null;
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month]) return null;
  return { month, day };
}

const LUCKY_COLORS = [
  { name: '빨간색', code: '#EF4444' },
  { name: '파란색', code: '#3B82F6' },
  { name: '노란색', code: '#EAB308' },
  { name: '초록색', code: '#22C55E' },
  { name: '보라색', code: '#8B5CF6' },
  { name: '주황색', code: '#F97316' },
  { name: '분홍색', code: '#EC4899' },
  { name: '금색', code: '#D4A017' },
  { name: '하늘색', code: '#38BDF8' },
];

const LUCKY_DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'];

const LUCKY_TIMES = [
  '오전 6시~8시', '오전 8시~10시', '오전 10시~12시',
  '오후 12시~2시', '오후 2시~4시', '오후 4시~6시',
  '오후 6시~8시', '오후 8시~10시',
];

const FORTUNE_MESSAGES = [
  '직감이 매우 예리한 날입니다. 번호 선택에 자신감을 가지세요!',
  '분석적 사고가 빛나는 타이밍입니다. 통계를 참고해보세요.',
  '행운의 기운이 강합니다. 과감한 시도가 좋은 결과를 가져올 수 있어요.',
  '인내심이 빛을 발하는 시기입니다. 꾸준히 도전해보세요.',
  '창의적 에너지가 넘칩니다. 남들과 다른 조합을 시도해보세요.',
  '주변과의 교류에서 행운의 힌트를 얻을 수 있습니다.',
  '꼼꼼한 준비가 행운을 부르는 날입니다.',
  '대범한 선택이 큰 행운으로 이어질 수 있어요.',
  '균형 잡힌 번호 조합이 유리합니다. 홀짝 균형을 맞춰보세요.',
  '직관을 믿고 첫 느낌의 번호를 선택하세요.',
  '오후 시간대에 구매하면 행운이 더 강해집니다.',
  '마음이 편안할 때 고른 번호가 가장 좋은 결과를 만듭니다.',
];

// --- Static Params: 366일 ---
export function generateStaticParams() {
  const params: { date: string }[] = [];
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= daysInMonth[m]; d++) {
      params.push({ date: `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = parseBirthdayDate(params.date);
  if (!parsed) return { title: '생일 행운번호 | 로또킹' };

  const { month, day } = parsed;
  const zodiac = getZodiac(month, day);
  const seed = month * 100 + day;
  const numbers = generateNumbers(seed);

  const title = `${month}월 ${day}일 생일 로또 행운번호 - ${zodiac.name} ${zodiac.emoji} | 로또킹`;
  const description = `${month}월 ${day}일 생일이라면 행운번호는 ${numbers.join(', ')}! ${zodiac.name}의 ${zodiac.trait} 성격에 맞는 로또 번호 분석과 당첨 통계를 확인하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/lotto/birthday/${params.date}` },
    openGraph: {
      title: `${month}월 ${day}일 생일 행운번호 - ${zodiac.name}`,
      description,
      url: `https://lotto.gon.ai.kr/lotto/birthday/${params.date}`,
    },
  };
}

export default async function BirthdayPage({ params }: Props) {
  const parsed = parseBirthdayDate(params.date);
  if (!parsed) notFound();

  const { month, day } = parsed;
  const zodiac = getZodiac(month, day);

  // 생일 기반 행운번호 생성 (fortune 페이지와 동일 시드)
  const seed = month * 100 + day;
  const numbers = generateNumbers(seed);

  // 추가 행운 정보 (시드 기반 결정론적)
  const rng = seededRandom(seed + 777);
  const luckyColor = LUCKY_COLORS[Math.floor(rng() * LUCKY_COLORS.length)];
  const luckyDirection = LUCKY_DIRECTIONS[Math.floor(rng() * LUCKY_DIRECTIONS.length)];
  const luckyTime = LUCKY_TIMES[Math.floor(rng() * LUCKY_TIMES.length)];
  const fortuneMessage = FORTUNE_MESSAGES[Math.floor(rng() * FORTUNE_MESSAGES.length)];

  // 수비학 생명수 (month + day 각 자리 합산 -> 한 자리)
  let lifePathSum = month + day;
  while (lifePathSum > 9 && lifePathSum !== 11 && lifePathSum !== 22) {
    lifePathSum = String(lifePathSum).split('').reduce((a, b) => a + parseInt(b), 0);
  }

  // 실제 로또 데이터에서 행운번호 출현 통계
  const allData = await getAllLottoData();
  const totalRounds = allData.length;
  const numberStats = numbers.map(num => ({
    number: num,
    frequency: LottoStatisticsAnalyzer.calculateFrequency(num, allData),
    lastAppeared: LottoStatisticsAnalyzer.calculateLastAppeared(num, allData),
    hotColdScore: LottoStatisticsAnalyzer.calculateHotColdScore(num, allData),
  }));

  // 행운번호 6개 중 실제 당첨에 3개 이상 포함된 회차
  const matchedRounds = allData
    .map(r => {
      const matched = numbers.filter(n => r.numbers.includes(n));
      return { round: r.round, date: r.drawDate, matchCount: matched.length, matchedNumbers: matched, numbers: r.numbers, bonus: r.bonusNumber };
    })
    .filter(r => r.matchCount >= 3)
    .sort((a, b) => b.matchCount - a.matchCount || b.round - a.round)
    .slice(0, 10);

  // 인접 날짜 네비게이션
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let prevMonth = month;
  let prevDay = day - 1;
  if (prevDay < 1) {
    prevMonth = month === 1 ? 12 : month - 1;
    prevDay = daysInMonth[prevMonth];
  }
  let nextMonth = month;
  let nextDay = day + 1;
  if (nextDay > daysInMonth[month]) {
    nextMonth = month === 12 ? 1 : month + 1;
    nextDay = 1;
  }
  const prevDate = `${String(prevMonth).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
  const nextDate = `${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;

  // JSON-LD structured data - all values derived from server-side lotto data (trusted source)
  // No user input is involved in generating these values
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${month}월 ${day}일 생일 로또 행운번호`,
    description: `${month}월 ${day}일 생일 기반 로또 6/45 행운번호 분석. ${zodiac.name} 별자리 운세와 번호별 당첨 통계를 포함합니다.`,
    url: `https://lotto.gon.ai.kr/lotto/birthday/${params.date}`,
    keywords: [`${month}월 ${day}일 로또`, '생일 행운번호', `${zodiac.name} 로또`, '로또 번호 추천'],
    creator: { '@type': 'Organization', name: '로또킹', url: 'https://lotto.gon.ai.kr' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${month}월 ${day}일 생일 로또 행운번호는?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${month}월 ${day}일 생일의 행운번호는 ${numbers.join(', ')}입니다. ${zodiac.name}(${zodiac.element} 원소)의 에너지를 반영한 번호 조합입니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `${month}월 ${day}일은 무슨 별자리인가요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${month}월 ${day}일은 ${zodiac.name}${zodiac.emoji}입니다. ${zodiac.trait} 성격의 소유자로, ${zodiac.element} 원소의 기운을 받습니다.`,
        },
      },
      {
        '@type': 'Question',
        name: `${month}월 ${day}일 행운번호가 실제로 당첨된 적이 있나요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: matchedRounds.length > 0
            ? `${month}월 ${day}일 행운번호 6개 중 3개 이상이 일치한 회차가 ${matchedRounds.length}회 있습니다. 최다 일치는 ${matchedRounds[0].matchCount}개(${matchedRounds[0].round}회차)입니다.`
            : `아직 3개 이상 일치한 회차는 없지만, 개별 번호들은 꾸준히 출현하고 있습니다.`,
        },
      },
    ],
  };

  // Server-generated JSON-LD from deterministic seed + trusted lotto draw data
  // Values: month/day from validated URL params, numbers from seeded RNG, stats from official draw results
  const jsonLdScript = JSON.stringify(jsonLd);
  const faqJsonLdScript = JSON.stringify(faqJsonLd);

  return (
    <>
      {/* eslint-disable-next-line -- JSON-LD structured data from server-side deterministic seed + trusted lotto data, no user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />
      {/* eslint-disable-next-line -- JSON-LD FAQ from server-side deterministic seed + trusted lotto data, no user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLdScript }} />

      <Breadcrumb items={[
        { label: '홈', href: '/' },
        { label: '행운번호', href: '/lotto/fortune' },
        { label: `${month}월 ${day}일` },
      ]} />

      <BirthdayContent
        month={month}
        day={day}
        numbers={numbers}
        zodiac={{ name: zodiac.name, emoji: zodiac.emoji, element: zodiac.element, trait: zodiac.trait }}
        luckyColor={luckyColor}
        luckyDirection={luckyDirection}
        luckyTime={luckyTime}
        fortuneMessage={fortuneMessage}
        lifePath={lifePathSum}
        numberStats={numberStats}
        matchedRounds={matchedRounds}
        totalRounds={totalRounds}
        prevDate={prevDate}
        nextDate={nextDate}
      />
    </>
  );
}

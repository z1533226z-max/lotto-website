/**
 * 사주 기반 오늘의 로또 행운번호 생성기
 * 매일 자정에 12띠별 행운번호를 결정론적으로 생성
 */

// 12띠 (지지)
export const ZODIAC_ANIMALS = [
  { key: 'rat', name: '쥐', emoji: '🐭', element: '수(水)' },
  { key: 'ox', name: '소', emoji: '🐮', element: '토(土)' },
  { key: 'tiger', name: '호랑이', emoji: '🐯', element: '목(木)' },
  { key: 'rabbit', name: '토끼', emoji: '🐰', element: '목(木)' },
  { key: 'dragon', name: '용', emoji: '🐲', element: '토(土)' },
  { key: 'snake', name: '뱀', emoji: '🐍', element: '화(火)' },
  { key: 'horse', name: '말', emoji: '🐴', element: '화(火)' },
  { key: 'sheep', name: '양', emoji: '🐑', element: '토(土)' },
  { key: 'monkey', name: '원숭이', emoji: '🐵', element: '금(金)' },
  { key: 'rooster', name: '닭', emoji: '🐔', element: '금(金)' },
  { key: 'dog', name: '개', emoji: '🐶', element: '토(土)' },
  { key: 'pig', name: '돼지', emoji: '🐷', element: '수(水)' },
] as const;

// 오행 속성별 행운 범위
const ELEMENT_RANGES: Record<string, number[]> = {
  '수(水)': [1, 6, 11, 16, 21, 26, 31, 36, 41],
  '목(木)': [3, 8, 13, 18, 23, 28, 33, 38, 43],
  '화(火)': [2, 7, 12, 17, 22, 27, 32, 37, 42],
  '토(土)': [5, 10, 15, 20, 25, 30, 35, 40, 45],
  '금(金)': [4, 9, 14, 19, 24, 29, 34, 39, 44],
};

// 총운 메시지
const FORTUNE_MESSAGES = [
  '대길! 오늘은 특별한 행운이 따르는 날입니다. 과감한 도전이 좋은 결과를 가져옵니다.',
  '길! 안정적인 흐름 속에서 작은 행운이 찾아옵니다. 평소의 번호를 믿어보세요.',
  '중길! 기대하지 않은 곳에서 기회가 옵니다. 새로운 시도가 행운을 부릅니다.',
  '소길! 꾸준함이 빛을 발하는 날입니다. 인내심을 갖고 기다려보세요.',
  '평운! 무난한 하루지만, 직감이 예리해지는 시간대를 활용하세요.',
  '상승운! 오후로 갈수록 운이 상승합니다. 저녁 시간대에 번호를 골라보세요.',
  '재물운 상승! 금전적인 흐름이 좋습니다. 지갑 속 동전의 숫자에 주목하세요.',
  '인연운! 주변 사람들과의 교류에서 행운의 힌트를 얻을 수 있습니다.',
];

// 재물운 메시지
const WEALTH_MESSAGES = [
  '재물운이 매우 강합니다. 투자나 복권 구매에 좋은 날!',
  '안정적인 재물 흐름. 무리하지 않는 범위에서 도전하세요.',
  '예상치 못한 소액의 행운이 있을 수 있습니다.',
  '절약하면서도 작은 투자는 괜찮은 날입니다.',
  '주변의 도움으로 재물운이 올라갑니다.',
  '오전보다 오후에 재물운이 강해집니다.',
];

const LUCKY_COLORS = [
  { name: '빨간색', code: '#EF4444' },
  { name: '파란색', code: '#3B82F6' },
  { name: '노란색', code: '#EAB308' },
  { name: '초록색', code: '#22C55E' },
  { name: '보라색', code: '#8B5CF6' },
  { name: '주황색', code: '#F97316' },
  { name: '분홍색', code: '#EC4899' },
  { name: '하늘색', code: '#06B6D4' },
];

const LUCKY_DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'];

const LUCKY_TIMES = [
  '오전 6시~8시', '오전 8시~10시', '오전 10시~12시',
  '오후 12시~2시', '오후 2시~4시', '오후 4시~6시',
  '오후 6시~8시', '오후 8시~10시',
];

// Seeded PRNG (결정론적)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 날짜 문자열에서 시드 생성 (YYYY-MM-DD)
function dateSeed(dateStr: string): number {
  return hashString(`daily-fortune-${dateStr}-v1`);
}

// 6개 고유 번호 생성 (1~45)
function generateNumbers(seed: number, elementFavorites?: number[]): number[] {
  const rng = seededRandom(seed);
  const numbers: Set<number> = new Set();

  // 오행 속성에 해당하는 번호 2개 우선 선택
  if (elementFavorites && elementFavorites.length > 0) {
    const shuffled = [...elementFavorites].sort(() => rng() - 0.5);
    for (const num of shuffled) {
      if (numbers.size >= 2) break;
      numbers.add(num);
    }
  }

  // 나머지는 랜덤
  while (numbers.size < 6) {
    const num = Math.floor(rng() * 45) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// 띠 판별 (생년 기준)
export function getZodiacAnimal(birthYear: number): typeof ZODIAC_ANIMALS[number] {
  const index = ((birthYear - 4) % 12 + 12) % 12;
  return ZODIAC_ANIMALS[index];
}

export interface DailyFortuneItem {
  animal: typeof ZODIAC_ANIMALS[number];
  numbers: number[];
  fortuneMessage: string;
  wealthMessage: string;
  luckyColor: { name: string; code: string };
  luckyDirection: string;
  luckyTime: string;
  luckyScore: number; // 1~5
}

export interface DailyFortuneData {
  date: string; // YYYY-MM-DD
  fortunes: DailyFortuneItem[];
  generatedAt: string;
}

// 메인: 특정 날짜의 12띠 행운번호 생성
export function generateDailyFortune(dateStr: string): DailyFortuneData {
  const baseSeed = dateSeed(dateStr);

  const fortunes: DailyFortuneItem[] = ZODIAC_ANIMALS.map((animal, idx) => {
    const animalSeed = baseSeed + idx * 7919; // 소수로 분산
    const rng = seededRandom(animalSeed);

    const elementFavorites = ELEMENT_RANGES[animal.element];
    const numbers = generateNumbers(animalSeed + 31, elementFavorites);

    const fortuneIdx = Math.floor(rng() * FORTUNE_MESSAGES.length);
    const wealthIdx = Math.floor(rng() * WEALTH_MESSAGES.length);
    const colorIdx = Math.floor(rng() * LUCKY_COLORS.length);
    const dirIdx = Math.floor(rng() * LUCKY_DIRECTIONS.length);
    const timeIdx = Math.floor(rng() * LUCKY_TIMES.length);
    const luckyScore = Math.floor(rng() * 5) + 1;

    return {
      animal,
      numbers,
      fortuneMessage: FORTUNE_MESSAGES[fortuneIdx],
      wealthMessage: WEALTH_MESSAGES[wealthIdx],
      luckyColor: LUCKY_COLORS[colorIdx],
      luckyDirection: LUCKY_DIRECTIONS[dirIdx],
      luckyTime: LUCKY_TIMES[timeIdx],
      luckyScore,
    };
  });

  return {
    date: dateStr,
    fortunes,
    generatedAt: new Date().toISOString(),
  };
}

// ── 날짜 유틸 (KST 기준) ──
// 서버(Vercel)는 UTC로 동작하므로 Date의 로컬 getter(getDate 등)를 쓰면 하루씩 어긋난다.
// 날짜 문자열(YYYY-MM-DD)은 UTC 자정으로만 다루고 getUTC*로 읽는다.
const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

/** 띠별 행운번호 유효 기간: 오늘 기준 과거 30일 ~ 내일 */
export const DAILY_FORTUNE_PAST_DAYS = 30;
export const DAILY_FORTUNE_FUTURE_DAYS = 1;

function parseDateUTC(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

// 오늘 날짜 (KST) 가져오기
export function getTodayKST(now: Date = new Date()): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().split('T')[0];
}

// 날짜 유효성 검증 (2026-02-31 같은 존재하지 않는 날짜도 거부)
export function isValidDate(dateStr: string): boolean {
  return parseDateUTC(dateStr) !== null;
}

// YYYY-MM-DD 문자열을 offsetDays만큼 이동
export function shiftDateStr(dateStr: string, offsetDays: number): string {
  const dt = parseDateUTC(dateStr);
  if (!dt) throw new Error(`Invalid date: ${dateStr}`);
  return new Date(dt.getTime() + offsetDays * DAY_MS).toISOString().split('T')[0];
}

// 유효 기간(과거 30일 ~ 내일) 안의 날짜인지
export function isDateInFortuneWindow(dateStr: string, today: string = getTodayKST()): boolean {
  if (!isValidDate(dateStr)) return false;
  return (
    dateStr >= shiftDateStr(today, -DAILY_FORTUNE_PAST_DAYS) &&
    dateStr <= shiftDateStr(today, DAILY_FORTUNE_FUTURE_DAYS)
  );
}

// 날짜 포맷: "2026년 3월 19일 (목)"
export function formatDateKorean(dateStr: string): string {
  const dt = parseDateUTC(dateStr);
  if (!dt) return dateStr;
  return `${dt.getUTCFullYear()}년 ${dt.getUTCMonth() + 1}월 ${dt.getUTCDate()}일 (${WEEKDAYS_KO[dt.getUTCDay()]})`;
}

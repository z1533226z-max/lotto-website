/**
 * 꿈해몽 로또번호 매핑 데이터
 * 전통 한국 꿈해몽을 기반으로 각 키워드에 로또번호를 매핑합니다.
 */

export interface DreamKeyword {
  keyword: string;
  numbers: number[];
  category: string;
  description: string;
}

export const DREAM_CATEGORIES = [
  '전체',
  '동물',
  '자연',
  '사물',
  '행동',
  '감정',
  '사람',
  '색깔',
] as const;

export type DreamCategory = (typeof DREAM_CATEGORIES)[number];

export const DREAM_KEYWORDS: DreamKeyword[] = [
  // ─── 동물 (15개) ───
  { keyword: '돼지', numbers: [3, 7, 34], category: '동물', description: '돼지꿈은 재물운이 들어오는 대표적인 길몽입니다.' },
  { keyword: '뱀', numbers: [6, 12, 24], category: '동물', description: '뱀꿈은 재물과 횡재를 상징하는 강력한 길몽입니다.' },
  { keyword: '호랑이', numbers: [15, 27, 38], category: '동물', description: '호랑이꿈은 권력과 성공을 예고하는 꿈입니다.' },
  { keyword: '용', numbers: [8, 18, 44], category: '동물', description: '용꿈은 최고의 길몽으로 큰 행운이 찾아옵니다.' },
  { keyword: '소', numbers: [5, 23, 41], category: '동물', description: '소꿈은 근면과 풍요를 상징하며 재물운을 뜻합니다.' },
  { keyword: '말', numbers: [9, 19, 36], category: '동물', description: '말꿈은 빠른 승진과 발전을 의미합니다.' },
  { keyword: '개', numbers: [2, 14, 30], category: '동물', description: '개꿈은 충성스러운 조력자의 등장을 암시합니다.' },
  { keyword: '고양이', numbers: [11, 21, 39], category: '동물', description: '고양이꿈은 직감과 영감이 높아지는 시기를 뜻합니다.' },
  { keyword: '물고기', numbers: [4, 16, 33], category: '동물', description: '물고기꿈은 재물이 모이고 풍요로워지는 길몽입니다.' },
  { keyword: '거북이', numbers: [7, 25, 43], category: '동물', description: '거북이꿈은 장수와 안정적인 행운을 상징합니다.' },
  { keyword: '닭', numbers: [10, 22, 35], category: '동물', description: '닭꿈은 새로운 소식과 기회가 찾아오는 꿈입니다.' },
  { keyword: '토끼', numbers: [1, 13, 28], category: '동물', description: '토끼꿈은 민첩한 행운과 기지를 상징합니다.' },
  { keyword: '원숭이', numbers: [20, 31, 42], category: '동물', description: '원숭이꿈은 지혜로운 해결책을 찾게 됨을 뜻합니다.' },
  { keyword: '코끼리', numbers: [17, 29, 45], category: '동물', description: '코끼리꿈은 큰 재물과 든든한 후원자를 의미합니다.' },
  { keyword: '새', numbers: [26, 37, 40], category: '동물', description: '새꿈은 자유와 높은 이상을 향한 도약을 뜻합니다.' },

  // ─── 자연 (15개) ───
  { keyword: '물', numbers: [4, 16, 28], category: '자연', description: '물꿈은 재물의 흐름과 감정의 정화를 상징합니다.' },
  { keyword: '불', numbers: [7, 19, 33], category: '자연', description: '불꿈은 열정과 변화, 때로는 큰 재물을 의미합니다.' },
  { keyword: '바람', numbers: [11, 23, 37], category: '자연', description: '바람꿈은 변화의 조짐과 새로운 기회를 뜻합니다.' },
  { keyword: '산', numbers: [8, 20, 42], category: '자연', description: '산꿈은 목표 달성과 높은 성취를 예고합니다.' },
  { keyword: '하늘', numbers: [15, 27, 44], category: '자연', description: '하늘꿈은 무한한 가능성과 큰 행운을 상징합니다.' },
  { keyword: '꽃', numbers: [3, 18, 35], category: '자연', description: '꽃꿈은 아름다운 결실과 기쁜 소식을 뜻합니다.' },
  { keyword: '나무', numbers: [6, 22, 40], category: '자연', description: '나무꿈은 성장과 발전, 든든한 기반을 의미합니다.' },
  { keyword: '비', numbers: [9, 25, 38], category: '자연', description: '비꿈은 시련 후의 풍요와 재물운을 상징합니다.' },
  { keyword: '눈', numbers: [12, 26, 41], category: '자연', description: '눈꿈은 순수한 행운과 새로운 시작을 뜻합니다.' },
  { keyword: '바다', numbers: [2, 14, 30], category: '자연', description: '바다꿈은 넓은 재물운과 무한한 기회를 의미합니다.' },
  { keyword: '강', numbers: [5, 17, 32], category: '자연', description: '강꿈은 인생의 흐름과 순탄한 진행을 상징합니다.' },
  { keyword: '태양', numbers: [1, 13, 45], category: '자연', description: '태양꿈은 밝은 미래와 큰 성공을 예고하는 길몽입니다.' },
  { keyword: '달', numbers: [10, 24, 36], category: '자연', description: '달꿈은 소원 성취와 로맨틱한 행운을 뜻합니다.' },
  { keyword: '별', numbers: [21, 33, 43], category: '자연', description: '별꿈은 희망과 소원이 이루어지는 꿈입니다.' },
  { keyword: '무지개', numbers: [29, 34, 39], category: '자연', description: '무지개꿈은 행운의 징조이며 소원 성취를 뜻합니다.' },

  // ─── 사물 (10개) ───
  { keyword: '돈', numbers: [7, 14, 33], category: '사물', description: '돈꿈은 직접적인 재물운의 상승을 의미합니다.' },
  { keyword: '금', numbers: [1, 18, 45], category: '사물', description: '금꿈은 최고의 재물운과 귀한 행운을 상징합니다.' },
  { keyword: '집', numbers: [5, 23, 38], category: '사물', description: '집꿈은 안정과 가정의 행복을 뜻합니다.' },
  { keyword: '차', numbers: [11, 27, 41], category: '사물', description: '차꿈은 빠른 진전과 새로운 출발을 의미합니다.' },
  { keyword: '열쇠', numbers: [8, 20, 36], category: '사물', description: '열쇠꿈은 문제 해결의 실마리와 기회를 뜻합니다.' },
  { keyword: '보석', numbers: [3, 15, 42], category: '사물', description: '보석꿈은 귀중한 기회와 큰 재물을 상징합니다.' },
  { keyword: '가방', numbers: [9, 25, 39], category: '사물', description: '가방꿈은 새로운 여행이나 기회의 시작을 뜻합니다.' },
  { keyword: '신발', numbers: [6, 22, 34], category: '사물', description: '신발꿈은 새로운 길과 전진을 의미합니다.' },
  { keyword: '시계', numbers: [12, 28, 43], category: '사물', description: '시계꿈은 중요한 시점과 결정의 때를 상징합니다.' },
  { keyword: '거울', numbers: [4, 16, 30], category: '사물', description: '거울꿈은 자기 성찰과 진실의 발견을 뜻합니다.' },

  // ─── 행동 (7개) ───
  { keyword: '날다', numbers: [15, 27, 44], category: '행동', description: '나는 꿈은 높은 성취와 자유로운 도약을 상징합니다.' },
  { keyword: '떨어지다', numbers: [2, 18, 33], category: '행동', description: '떨어지는 꿈은 역설적으로 상승의 전조가 됩니다.' },
  { keyword: '울다', numbers: [8, 22, 37], category: '행동', description: '우는 꿈은 감정의 해소와 기쁜 반전을 의미합니다.' },
  { keyword: '웃다', numbers: [5, 19, 40], category: '행동', description: '웃는 꿈은 기쁜 소식과 행복한 일이 다가옴을 뜻합니다.' },
  { keyword: '달리다', numbers: [11, 25, 42], category: '행동', description: '달리는 꿈은 목표를 향한 빠른 전진을 상징합니다.' },
  { keyword: '수영', numbers: [4, 16, 35], category: '행동', description: '수영하는 꿈은 어려움을 헤쳐나가는 능력을 뜻합니다.' },
  { keyword: '싸우다', numbers: [9, 23, 38], category: '행동', description: '싸우는 꿈은 경쟁에서의 승리와 강한 의지를 의미합니다.' },

  // ─── 감정 (4개) ───
  { keyword: '기쁨', numbers: [1, 13, 33], category: '감정', description: '기쁨의 꿈은 실제 행복한 일이 다가옴을 예고합니다.' },
  { keyword: '슬픔', numbers: [8, 20, 35], category: '감정', description: '슬픔의 꿈은 곧 기쁨으로 반전될 것을 암시합니다.' },
  { keyword: '공포', numbers: [6, 18, 30], category: '감정', description: '공포의 꿈은 두려움을 극복하고 성장할 것을 뜻합니다.' },
  { keyword: '사랑', numbers: [3, 15, 42], category: '감정', description: '사랑의 꿈은 인간관계의 행운과 따뜻함을 상징합니다.' },

  // ─── 사람 (4개) ───
  { keyword: '아기', numbers: [1, 7, 13], category: '사람', description: '아기꿈은 새로운 시작과 탄생의 기운을 의미합니다.' },
  { keyword: '노인', numbers: [9, 27, 45], category: '사람', description: '노인꿈은 지혜로운 조언과 깊은 행운을 상징합니다.' },
  { keyword: '유명인', numbers: [11, 23, 38], category: '사람', description: '유명인꿈은 사회적 성공과 명예를 예고합니다.' },
  { keyword: '가족', numbers: [5, 19, 33], category: '사람', description: '가족꿈은 화목과 가정의 행운을 뜻합니다.' },

  // ─── 색깔 (6개) ───
  { keyword: '빨강', numbers: [7, 14, 27], category: '색깔', description: '빨간색 꿈은 열정과 강한 에너지, 행운을 상징합니다.' },
  { keyword: '파랑', numbers: [3, 18, 33], category: '색깔', description: '파란색 꿈은 평화로운 행운과 안정을 뜻합니다.' },
  { keyword: '노랑', numbers: [1, 15, 42], category: '색깔', description: '노란색 꿈은 밝은 재물운과 희망을 의미합니다.' },
  { keyword: '초록', numbers: [5, 22, 39], category: '색깔', description: '초록색 꿈은 성장과 건강한 행운을 상징합니다.' },
  { keyword: '하양', numbers: [10, 28, 44], category: '색깔', description: '하얀색 꿈은 순수한 행운과 새로운 출발을 뜻합니다.' },
  { keyword: '검정', numbers: [8, 20, 36], category: '색깔', description: '검은색 꿈은 숨겨진 행운과 깊은 통찰을 의미합니다.' },
];

/**
 * 인기 키워드 (사용자에게 먼저 노출)
 */
export const POPULAR_KEYWORDS = [
  '돼지', '뱀', '용', '돈', '금', '물고기',
  '태양', '물', '불', '보석', '호랑이', '꽃',
  '날다', '아기', '무지개', '바다',
];

/** MBTI별 로또 번호 추천 데이터 */

export interface MbtiProfile {
  type: string;
  name: string;
  emoji: string;
  group: 'analyst' | 'diplomat' | 'sentinel' | 'explorer';
  groupName: string;
  trait: string;
  description: string;
  strategy: string;
  luckyNumbers: number[];    // 6개 고정 추천 번호
  avoidNumbers: number[];    // 3개 비추천 번호
  bestPairType: string;      // 궁합 좋은 MBTI
  worstPairType: string;     // 궁합 나쁜 MBTI
  purchaseTip: string;
  faqs: { question: string; answer: string }[];
}

export const MBTI_PROFILES: MbtiProfile[] = [
  // === 분석가 (Analyst) ===
  {
    type: 'INTJ',
    name: '전략가',
    emoji: '🏗️',
    group: 'analyst',
    groupName: '분석가형',
    trait: '독립적이고 전략적인 사고의 소유자',
    description: 'INTJ는 치밀한 계획과 분석으로 모든 일에 접근합니다. 로또에서도 통계와 패턴 분석을 통해 번호를 선택하는 경향이 있습니다. 직감보다 데이터를 신뢰하며, 한번 정한 전략을 꾸준히 유지하는 것이 특징입니다.',
    strategy: '통계 기반 번호 선택을 추천합니다. 최근 50회차 출현 빈도를 분석하고, 출현 주기가 돌아온 번호를 중심으로 선택하세요. 같은 번호를 꾸준히 구매하는 고정수 전략이 INTJ에게 잘 맞습니다.',
    luckyNumbers: [3, 14, 21, 28, 35, 42],
    avoidNumbers: [7, 13, 44],
    bestPairType: 'ENTP',
    worstPairType: 'ESFP',
    purchaseTip: '매주 같은 시간, 같은 매장에서 구매하세요. 루틴을 지키는 것이 행운을 부릅니다.',
    faqs: [
      { question: 'INTJ에게 어울리는 로또 구매 전략은?', answer: 'INTJ는 통계 분석을 기반으로 번호를 선택하는 전략이 가장 적합합니다. 최근 50~100회차의 출현 빈도를 분석하고, 과거 패턴에서 규칙성을 찾아 번호를 고르세요. 한번 정한 번호를 꾸준히 유지하는 고정수 전략도 잘 맞습니다.' },
      { question: 'INTJ의 로또 행운 번호는 어떻게 정해지나요?', answer: '각 MBTI 유형의 성격 특성에서 수비학적 에너지를 도출합니다. INTJ의 전략적이고 분석적인 성향은 3(창의), 14(균형), 21(완성), 28(순환), 35(변화), 42(지혜)의 에너지와 공명합니다.' },
    ],
  },
  {
    type: 'INTP',
    name: '논리술사',
    emoji: '🔬',
    group: 'analyst',
    groupName: '분석가형',
    trait: '호기심 많고 논리적인 발명가',
    description: 'INTP는 끊임없이 새로운 가능성을 탐구합니다. 로또 번호 선택에서도 독창적인 방법을 시도하며, 수학적 확률과 패턴에 관심이 많습니다. 여러 가지 조합을 실험하는 것을 즐깁니다.',
    strategy: '확률론적 접근을 추천합니다. AC값, 홀짝 비율, 연번 패턴 등 다양한 필터를 조합하여 번호를 선택하세요. 매주 다른 조합 전략을 실험하는 것도 INTP에게 흥미로운 방법입니다.',
    luckyNumbers: [5, 11, 19, 27, 33, 41],
    avoidNumbers: [2, 22, 40],
    bestPairType: 'ENTJ',
    worstPairType: 'ESFJ',
    purchaseTip: '복권 구매 전 간단한 수학 퍼즐을 풀어보세요. 두뇌가 활성화된 상태에서 직감이 더 정확해집니다.',
    faqs: [
      { question: 'INTP에게 맞는 로또 번호 선택 방법은?', answer: 'INTP는 다양한 확률론적 필터를 조합하는 방식이 잘 맞습니다. AC값, 홀짝 비율, 고저 비율, 연번 포함 여부 등 여러 기준을 동시에 적용해 최적의 조합을 찾아보세요.' },
      { question: 'INTP가 로또를 살 때 주의할 점은?', answer: '너무 많은 분석에 빠져 결정 장애를 겪지 않도록 주의하세요. 분석은 번호 선택 전까지만 하고, 일단 선택했으면 결과에 집착하지 않는 것이 중요합니다.' },
    ],
  },
  {
    type: 'ENTJ',
    name: '통솔자',
    emoji: '👑',
    group: 'analyst',
    groupName: '분석가형',
    trait: '대담하고 결단력 있는 리더',
    description: 'ENTJ는 목표 지향적이며 효율을 중시합니다. 로또에서도 체계적인 접근을 선호하며, 당첨금 규모에 따른 전략적 구매를 합니다. 단 1장이라도 확신을 갖고 구매합니다.',
    strategy: '목표 금액을 정하고 역산하여 구매 전략을 세우세요. 1등을 노리기보다 2~3등의 확률이 높은 번호 조합을 선택하는 실용적 접근이 ENTJ에게 맞습니다.',
    luckyNumbers: [1, 10, 18, 26, 37, 45],
    avoidNumbers: [9, 17, 38],
    bestPairType: 'INTP',
    worstPairType: 'ISFP',
    purchaseTip: '큰 결정을 내린 후에 복권을 구매하세요. 결단의 에너지가 행운을 끌어당깁니다.',
    faqs: [
      { question: 'ENTJ의 로또 행운번호 특징은?', answer: 'ENTJ의 행운번호는 리더십과 시작의 에너지를 담고 있습니다. 1(시작), 10(완성), 18(도전), 26(균형), 37(창조), 45(최고)로 구성되어 대담한 결단력을 상징합니다.' },
      { question: 'ENTJ가 로또 공동구매를 하면?', answer: 'ENTJ는 공동구매에서 자연스럽게 리더 역할을 맡게 됩니다. 구매 전략을 세우고 팀원들의 번호를 조율하는 역할이 잘 맞으며, 조직적인 구매가 오히려 당첨 확률을 높일 수 있습니다.' },
    ],
  },
  {
    type: 'ENTP',
    name: '변론가',
    emoji: '💡',
    group: 'analyst',
    groupName: '분석가형',
    trait: '영리하고 호기심 많은 사상가',
    description: 'ENTP는 기존의 틀을 깨는 것을 좋아합니다. 로또에서도 남들이 선택하지 않는 번호 조합을 시도하며, "만약에..."를 즐깁니다. 한 가지 방법에 얽매이지 않는 유연한 접근이 특징입니다.',
    strategy: '역발상 전략을 추천합니다. 인기 없는 번호 조합을 선택하면 당첨 시 나눠야 할 금액이 적어집니다. 매주 완전히 다른 방식으로 번호를 고르는 것도 ENTP에게 잘 맞습니다.',
    luckyNumbers: [4, 13, 22, 29, 36, 43],
    avoidNumbers: [6, 15, 30],
    bestPairType: 'INTJ',
    worstPairType: 'ISFJ',
    purchaseTip: '새로운 장소에서, 평소와 다른 시간에 구매하세요. 변화가 행운의 열쇠입니다.',
    faqs: [
      { question: 'ENTP에게 추천하는 로또 전략은?', answer: '역발상 전략이 가장 잘 맞습니다. 다수가 선택하는 인기 번호를 피하고, 비인기 번호 위주로 선택하면 당첨 시 1인당 배분 금액이 높아집니다. 매주 완전히 새로운 방식으로 도전해보세요.' },
      { question: 'ENTP가 로또에서 피해야 할 함정은?', answer: '너무 많은 가능성을 동시에 추구하다가 예산을 초과하는 것을 조심하세요. 한 주에 5장 이하로 제한하고, 각 장마다 명확한 전략적 차이를 두는 것이 좋습니다.' },
    ],
  },

  // === 외교관 (Diplomat) ===
  {
    type: 'INFJ',
    name: '옹호자',
    emoji: '🌟',
    group: 'diplomat',
    groupName: '외교관형',
    trait: '조용하지만 영감 넘치는 이상주의자',
    description: 'INFJ는 직감이 매우 뛰어난 유형입니다. 로또 번호 선택에서도 분석보다 느낌에 의존하는 경향이 있으며, 꿈이나 영감에서 번호를 얻는 경우가 많습니다.',
    strategy: '직감과 꿈을 활용하세요. 꿈에서 본 숫자나 장면을 꿈해몽으로 해석하여 번호를 선택하는 것이 INFJ에게 매우 잘 맞습니다. 명상 후 떠오르는 숫자도 좋은 선택지입니다.',
    luckyNumbers: [7, 12, 20, 31, 38, 44],
    avoidNumbers: [1, 10, 45],
    bestPairType: 'ENFP',
    worstPairType: 'ESTP',
    purchaseTip: '조용한 시간에 명상한 후 떠오르는 숫자를 메모하세요. INFJ의 직감은 강력합니다.',
    faqs: [
      { question: 'INFJ가 로또를 살 때 직감을 믿어도 되나요?', answer: 'INFJ는 16가지 MBTI 유형 중 직감이 가장 강한 유형입니다. 꿈해몽이나 명상에서 떠오른 숫자를 활용하는 것이 오히려 통계적 접근보다 INFJ에게 잘 맞을 수 있습니다.' },
      { question: 'INFJ의 행운번호는 왜 7이 포함되나요?', answer: '7은 영적 깨달음과 직관의 숫자입니다. INFJ의 깊은 통찰력과 이상주의적 성향에 7의 에너지가 가장 잘 공명합니다.' },
    ],
  },
  {
    type: 'INFP',
    name: '중재자',
    emoji: '🦋',
    group: 'diplomat',
    groupName: '외교관형',
    trait: '이상주의적이고 감성적인 치유자',
    description: 'INFP는 의미와 가치를 중요시합니다. 로또 번호도 단순한 숫자가 아닌, 특별한 의미가 있는 번호를 선호합니다. 기념일, 좋아하는 숫자, 소중한 사람의 생일 등에서 영감을 얻습니다.',
    strategy: '의미 있는 숫자를 조합하세요. 가족의 생일, 기념일, 좋아하는 숫자 등 개인적으로 의미가 있는 번호를 포함시키되, 통계적 균형도 함께 고려하세요.',
    luckyNumbers: [2, 15, 23, 30, 34, 39],
    avoidNumbers: [8, 26, 41],
    bestPairType: 'ENFJ',
    worstPairType: 'ESTJ',
    purchaseTip: '소중한 사람을 위해 복권을 선물하세요. 이타적인 에너지가 행운을 부릅니다.',
    faqs: [
      { question: 'INFP가 의미 있는 번호로만 로또를 사면 괜찮나요?', answer: '완전히 괜찮습니다! 로또의 모든 번호 조합은 수학적으로 동일한 확률을 가집니다. 의미 있는 번호를 선택하면 구매 자체에서 즐거움을 느낄 수 있어 INFP에게 최적의 방법입니다.' },
      { question: 'INFP와 궁합 좋은 MBTI와 공동구매하면?', answer: 'ENFJ와의 공동구매가 추천됩니다. ENFJ의 실행력과 INFP의 직감이 조합되면 균형 잡힌 번호 선택이 가능합니다.' },
    ],
  },
  {
    type: 'ENFJ',
    name: '선도자',
    emoji: '🎯',
    group: 'diplomat',
    groupName: '외교관형',
    trait: '카리스마 있고 영감을 주는 리더',
    description: 'ENFJ는 사람들과 함께할 때 에너지가 극대화됩니다. 로또도 혼자보다 공동구매를 선호하며, 당첨금을 나누는 것에 대한 거부감이 적습니다. 주변 사람들의 의견을 반영하여 번호를 선택합니다.',
    strategy: '공동구매를 강력히 추천합니다. 5~10명이 모여 각자 1~2개씩 번호를 제안하고 투표로 최종 번호를 결정하세요. 사회적 에너지가 당첨 확률을 높여줍니다.',
    luckyNumbers: [6, 16, 24, 32, 38, 43],
    avoidNumbers: [4, 14, 35],
    bestPairType: 'INFP',
    worstPairType: 'ISTP',
    purchaseTip: '친구나 동료와 함께 매장을 방문하세요. 함께하는 에너지가 행운을 끌어당깁니다.',
    faqs: [
      { question: 'ENFJ가 공동구매를 할 때 주의점은?', answer: '리더 역할을 맡되, 모든 참여자의 의견을 공평하게 반영하세요. 번호 선택 과정을 투명하게 공유하고, 당첨 시 배분 규칙을 미리 정해두는 것이 중요합니다.' },
      { question: 'ENFJ의 로또 행운 요일은?', answer: 'ENFJ는 사회적 에너지가 높은 금요일 저녁에 구매하는 것이 좋습니다. 한 주의 사회적 활동으로 축적된 긍정 에너지가 행운번호 선택에 영향을 줄 수 있습니다.' },
    ],
  },
  {
    type: 'ENFP',
    name: '활동가',
    emoji: '🎭',
    group: 'diplomat',
    groupName: '외교관형',
    trait: '열정적이고 자유로운 영혼',
    description: 'ENFP는 즉흥성과 직감의 대가입니다. 로또 번호 선택에서도 계획보다는 순간의 느낌을 중시합니다. 자동 번호 생성을 좋아하며, "오늘 느낌이 좋다!"라는 직감에 따라 구매합니다.',
    strategy: '자동 번호 + 직감 조합을 추천합니다. 3장은 자동으로, 2장은 직감 번호로 구매하세요. ENFP의 즉흥적 에너지는 계획적 접근보다 자유로운 선택에서 더 빛납니다.',
    luckyNumbers: [8, 17, 25, 33, 39, 44],
    avoidNumbers: [3, 11, 28],
    bestPairType: 'INFJ',
    worstPairType: 'ISTJ',
    purchaseTip: '기분이 좋은 날, 갑자기 "사야겠다!"는 느낌이 올 때 구매하세요. 충동이 아닌 직감입니다.',
    faqs: [
      { question: 'ENFP가 자동으로 사는 것이 더 나을까요?', answer: 'ENFP에게는 반자동이 가장 좋습니다. 3개 번호는 직감으로 선택하고 나머지 3개는 자동으로 채우는 방식이 ENFP의 자유로운 성향과 잘 맞습니다.' },
      { question: 'ENFP가 매주 같은 번호를 사면?', answer: 'ENFP의 성향상 같은 번호를 반복하면 흥미를 잃을 수 있습니다. 매주 새로운 번호에 도전하는 것이 ENFP의 열정을 유지하는 비결입니다.' },
    ],
  },

  // === 관리자 (Sentinel) ===
  {
    type: 'ISTJ',
    name: '현실주의자',
    emoji: '📋',
    group: 'sentinel',
    groupName: '관리자형',
    trait: '책임감 있고 꼼꼼한 실천가',
    description: 'ISTJ는 체계적이고 신뢰할 수 있는 유형입니다. 로또에서도 일관된 패턴을 유지하며, 매주 같은 번호를 꾸준히 구매하는 경향이 있습니다. 데이터와 과거 기록을 중시합니다.',
    strategy: '고정수 전략이 ISTJ에게 최적입니다. 한번 정한 6개 번호를 변경하지 않고 꾸준히 구매하세요. 로또 당첨번호 기록을 엑셀로 관리하면서 패턴을 추적하는 것도 추천합니다.',
    luckyNumbers: [4, 12, 20, 28, 36, 40],
    avoidNumbers: [7, 13, 33],
    bestPairType: 'ESFJ',
    worstPairType: 'ENFP',
    purchaseTip: '매주 토요일 같은 시간에, 같은 매장에서 구매하세요. 루틴이 곧 행운입니다.',
    faqs: [
      { question: 'ISTJ가 고정수 전략을 쓸 때 몇 주까지 유지해야 하나요?', answer: '최소 52주(1년) 이상 유지하는 것을 추천합니다. ISTJ의 장점인 인내심과 꾸준함이 고정수 전략의 핵심이며, 장기적으로 볼 때 매주 번호를 바꾸는 것과 확률은 동일합니다.' },
      { question: 'ISTJ에게 자동 번호는 맞지 않나요?', answer: '자동 번호는 ISTJ의 체계적 성향과 다소 맞지 않을 수 있습니다. 직접 분석한 번호에 대한 확신이 ISTJ의 구매 만족도를 높여줍니다.' },
    ],
  },
  {
    type: 'ISFJ',
    name: '수호자',
    emoji: '🛡️',
    group: 'sentinel',
    groupName: '관리자형',
    trait: '따뜻하고 헌신적인 보호자',
    description: 'ISFJ는 가족과 주변 사람들을 위해 로또를 구매하는 경우가 많습니다. 안정적이고 보수적인 접근을 선호하며, 큰 금액보다는 소액 꾸준히 구매하는 것을 좋아합니다.',
    strategy: '가족 번호 전략을 추천합니다. 가족 구성원의 생일이나 기념일에서 번호를 추출하되, 모든 번호가 31 이하에 몰리지 않도록 통계적 보정을 추가하세요.',
    luckyNumbers: [2, 9, 18, 25, 34, 41],
    avoidNumbers: [5, 23, 43],
    bestPairType: 'ISTJ',
    worstPairType: 'ENTP',
    purchaseTip: '가족을 생각하며 번호를 고르세요. 사랑하는 마음이 행운의 원천입니다.',
    faqs: [
      { question: 'ISFJ가 가족 생일로 번호를 고르면 확률이 낮아지나요?', answer: '생일 번호(1~31)만으로 구성하면 32~45 번호가 빠져 실제 당첨 확률은 동일하지만 당첨금 배분에서 불리할 수 있습니다. 2~3개는 생일에서, 나머지는 32~45 구간에서 선택하는 것이 좋습니다.' },
      { question: 'ISFJ에게 맞는 구매 금액은?', answer: 'ISFJ는 안정을 중시하므로, 가계에 부담이 되지 않는 선에서 매주 1~2장(1,000~2,000원)을 꾸준히 구매하는 것이 가장 적합합니다.' },
    ],
  },
  {
    type: 'ESTJ',
    name: '경영자',
    emoji: '📊',
    group: 'sentinel',
    groupName: '관리자형',
    trait: '체계적이고 관리 능력이 뛰어난 실천가',
    description: 'ESTJ는 규칙과 체계를 중시합니다. 로또 구매에서도 예산을 정하고, 기록을 남기며, 체계적으로 관리합니다. 공동구매를 주도하며 규칙을 만드는 것을 좋아합니다.',
    strategy: '체계적 관리 전략을 추천합니다. 월별 로또 예산을 정하고, 구매 기록과 결과를 스프레드시트로 관리하세요. 과거 데이터에서 패턴을 찾아 다음 구매에 반영하는 방식이 ESTJ에게 잘 맞습니다.',
    luckyNumbers: [1, 10, 19, 27, 35, 44],
    avoidNumbers: [6, 16, 39],
    bestPairType: 'ISFJ',
    worstPairType: 'INFP',
    purchaseTip: '구매 일지를 작성하세요. 날짜, 번호, 결과를 기록하면 나만의 패턴을 발견할 수 있습니다.',
    faqs: [
      { question: 'ESTJ가 로또 기록을 관리하면 도움이 되나요?', answer: '당첨 확률 자체를 높이지는 않지만, 구매 패턴을 파악하고 예산을 효율적으로 관리하는 데 큰 도움이 됩니다. ESTJ의 체계적 성향을 활용한 최적의 접근법입니다.' },
      { question: 'ESTJ가 공동구매를 주도할 때 팁은?', answer: '참여 규칙, 금액 배분, 당첨금 분배 방식을 사전에 서면으로 정리하세요. ESTJ의 조직력이 공동구매의 성공률을 높여줍니다.' },
    ],
  },
  {
    type: 'ESFJ',
    name: '집정관',
    emoji: '🤝',
    group: 'sentinel',
    groupName: '관리자형',
    trait: '사교적이고 배려심 깊은 돌봄이',
    description: 'ESFJ는 함께하는 것을 좋아합니다. 로또도 혼자보다 가족이나 친구와 함께 고르는 것을 선호하며, 당첨의 기쁨을 나누고 싶어합니다. 주변 사람들의 추천 번호를 잘 받아들입니다.',
    strategy: '소셜 번호 선택을 추천합니다. 가족이나 친구 모임에서 각자 1개씩 번호를 제안받아 조합하세요. 관계에서 오는 에너지가 ESFJ의 행운을 극대화합니다.',
    luckyNumbers: [6, 14, 22, 30, 37, 42],
    avoidNumbers: [3, 19, 36],
    bestPairType: 'ESTJ',
    worstPairType: 'INTP',
    purchaseTip: '친구와 함께 매장을 방문하세요. 웃으면서 고른 번호가 행운을 가져옵니다.',
    faqs: [
      { question: 'ESFJ가 주변 사람의 추천 번호를 조합하면?', answer: '훌륭한 전략입니다! ESFJ의 사회적 에너지는 다양한 사람들의 직감을 모을 때 극대화됩니다. 가족이나 친구 6명에게 각각 1개씩 번호를 받아 조합하는 것을 추천합니다.' },
      { question: 'ESFJ가 혼자 로또를 사면 운이 나빠지나요?', answer: '운이 나빠지지는 않지만, ESFJ의 사교적 에너지가 활성화된 상태에서 번호를 선택하는 것이 더 좋은 결과로 이어질 수 있습니다.' },
    ],
  },

  // === 탐험가 (Explorer) ===
  {
    type: 'ISTP',
    name: '장인',
    emoji: '🔧',
    group: 'explorer',
    groupName: '탐험가형',
    trait: '대담하고 실용적인 문제해결사',
    description: 'ISTP는 실용적이고 효율적인 접근을 선호합니다. 로또에서도 감정보다 논리를 따르며, "될 때 되는 거다"라는 담담한 태도를 보입니다. 복잡한 분석보다 간결한 방법을 선호합니다.',
    strategy: '효율 극대화 전략을 추천합니다. 자동 5장을 구매하는 것이 ISTP에게 가장 효율적입니다. 시간 대비 기대값을 따지면, 분석에 시간을 쓰는 것보다 자동 구매가 합리적입니다.',
    luckyNumbers: [3, 11, 21, 29, 38, 43],
    avoidNumbers: [2, 16, 34],
    bestPairType: 'ESTP',
    worstPairType: 'ENFJ',
    purchaseTip: '직감적으로 "오늘이다" 싶을 때만 구매하세요. ISTP의 본능적 판단은 꽤 정확합니다.',
    faqs: [
      { question: 'ISTP에게 자동이 더 맞는 이유는?', answer: 'ISTP는 효율을 중시합니다. 번호 분석에 30분을 투자해도 당첨 확률은 자동과 동일합니다. 차라리 그 시간을 다른 생산적인 활동에 투자하고, 로또는 자동으로 간편하게 구매하는 것이 ISTP의 실용적 성향에 맞습니다.' },
      { question: 'ISTP가 반자동을 사용한다면?', answer: '1~2개 번호만 고정하고 나머지는 자동으로 채우세요. 최소한의 노력으로 "내 번호"라는 소유감을 가질 수 있습니다.' },
    ],
  },
  {
    type: 'ISFP',
    name: '모험가',
    emoji: '🎨',
    group: 'explorer',
    groupName: '탐험가형',
    trait: '유연하고 매력적인 예술가',
    description: 'ISFP는 아름다움과 조화를 추구합니다. 로또 번호 선택에서도 숫자의 시각적 배열이나 느낌을 중시합니다. 로또 용지에 색칠할 때 예쁜 패턴이 나오는 번호를 선호하기도 합니다.',
    strategy: '감성 기반 선택을 추천합니다. 로또 용지를 바라보며 "예쁘다"고 느껴지는 번호 배치를 선택하세요. 시각적 직감은 ISFP만의 독특한 무기입니다.',
    luckyNumbers: [5, 15, 23, 31, 36, 42],
    avoidNumbers: [1, 10, 40],
    bestPairType: 'ESFP',
    worstPairType: 'ENTJ',
    purchaseTip: '마음이 편안하고 행복한 순간에 번호를 고르세요. 감정 상태가 번호 선택의 질을 좌우합니다.',
    faqs: [
      { question: 'ISFP가 번호 배치의 시각적 패턴을 따르면?', answer: '로또의 모든 번호 조합은 동일한 확률이므로, 시각적으로 마음에 드는 패턴을 선택해도 전혀 문제없습니다. 오히려 구매 과정 자체를 즐길 수 있어 ISFP에게 최적의 방법입니다.' },
      { question: 'ISFP의 로또 행운 색상은?', answer: '보라색(31~40번 구간)과 초록색(41~45번 구간)이 ISFP의 창의적 에너지와 공명합니다. 이 구간의 번호를 2개 이상 포함시켜 보세요.' },
    ],
  },
  {
    type: 'ESTP',
    name: '사업가',
    emoji: '🎲',
    group: 'explorer',
    groupName: '탐험가형',
    trait: '에너지 넘치고 행동력 있는 모험가',
    description: 'ESTP는 스릴과 도전을 즐깁니다. 로또도 당첨 자체보다 추첨 과정의 긴장감과 흥분을 즐기는 경향이 있습니다. 한번에 여러 장을 구매하는 과감한 스타일입니다.',
    strategy: '다양성 전략을 추천합니다. 5장을 구매한다면, 각 장마다 완전히 다른 전략을 적용하세요. 1장은 자동, 1장은 고정수, 1장은 직감, 1장은 역발상, 1장은 생일 번호. 다양성이 ESTP의 무기입니다.',
    luckyNumbers: [7, 13, 24, 32, 39, 45],
    avoidNumbers: [4, 18, 37],
    bestPairType: 'ISTP',
    worstPairType: 'INFJ',
    purchaseTip: '큰 경기나 이벤트가 있는 날에 구매하세요. 흥분과 에너지가 높을 때가 행운의 시간입니다.',
    faqs: [
      { question: 'ESTP가 한번에 많이 사는 것이 좋은가요?', answer: '흥분에 휩쓸려 예산을 초과하지 않도록 주의하세요. 매주 구매 한도를 정해두고, 그 안에서 다양한 전략을 시도하는 것이 스릴도 느끼면서 합리적으로 즐기는 방법입니다.' },
      { question: 'ESTP에게 가장 행운의 구매 시간은?', answer: '토요일 오후 4~6시, 추첨 직전의 긴장감이 최고조일 때가 ESTP의 직감이 가장 날카로워지는 시간입니다.' },
    ],
  },
  {
    type: 'ESFP',
    name: '연예인',
    emoji: '🎉',
    group: 'explorer',
    groupName: '탐험가형',
    trait: '사교적이고 즉흥적인 엔터테이너',
    description: 'ESFP는 인생을 즐기는 달인입니다. 로또도 투자가 아닌 즐거운 놀이로 접근합니다. 파티나 모임에서 즉흥적으로 구매하는 경우가 많으며, 당첨보다 과정을 즐깁니다.',
    strategy: '즐거운 놀이 전략을 추천합니다. 친구들과 로또 파티를 열어보세요. 각자 번호를 공개하고, 누가 더 잘 맞추는지 게임처럼 즐기면 ESFP의 에너지가 극대화됩니다.',
    luckyNumbers: [8, 16, 25, 33, 40, 44],
    avoidNumbers: [2, 12, 29],
    bestPairType: 'ISFP',
    worstPairType: 'INTJ',
    purchaseTip: '분위기 좋은 모임 후, 기분이 최고일 때 구매하세요. ESFP의 즐거운 에너지가 곧 행운입니다.',
    faqs: [
      { question: 'ESFP가 즉흥적으로 사도 괜찮나요?', answer: 'ESFP의 즉흥성은 오히려 강점입니다! 기분이 좋고 에너지가 넘칠 때 즉흥적으로 구매하면, 그 긍정적 에너지가 번호 선택에 반영됩니다. 다만 예산 한도는 미리 정해두세요.' },
      { question: 'ESFP 로또 파티는 어떻게 하나요?', answer: '5명 이상 모여서 각자 1장씩 번호를 고르고, 추첨 결과를 함께 확인하는 방식입니다. 가장 많이 맞춘 사람에게 소정의 상품을 주면 더 재미있습니다.' },
    ],
  },
];

export const MBTI_TYPES = MBTI_PROFILES.map(p => p.type);

export function getMbtiProfile(type: string): MbtiProfile | undefined {
  return MBTI_PROFILES.find(p => p.type === type.toUpperCase());
}

export function getMbtiGroup(group: MbtiProfile['group']): MbtiProfile[] {
  return MBTI_PROFILES.filter(p => p.group === group);
}

export const MBTI_GROUP_INFO: Record<MbtiProfile['group'], { name: string; emoji: string; color: string }> = {
  analyst: { name: '분석가형', emoji: '🧠', color: '#8B5CF6' },
  diplomat: { name: '외교관형', emoji: '🌿', color: '#22C55E' },
  sentinel: { name: '관리자형', emoji: '🛡️', color: '#3B82F6' },
  explorer: { name: '탐험가형', emoji: '🎯', color: '#EAB308' },
};

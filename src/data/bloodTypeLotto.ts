/** 혈액형별 로또 행운번호 데이터 */

export interface BloodTypeProfile {
  id: string;
  name: string;
  emoji: string;
  trait: string;
  description: string;
  strategy: string;
  luckyNumbers: number[];
  avoidNumbers: number[];
  bestPairId: string;
  worstPairId: string;
  purchaseTip: string;
  percentage: string;
  faqs: { question: string; answer: string }[];
}

export const BLOOD_TYPE_IDS = ['a', 'b', 'o', 'ab'] as const;
export type BloodTypeId = typeof BLOOD_TYPE_IDS[number];

export const BLOOD_TYPE_PROFILES: BloodTypeProfile[] = [
  {
    id: 'a',
    name: 'A형',
    emoji: '🅰️',
    trait: '꼼꼼하고 신중한 계획가',
    description: 'A형은 세심하고 계획적인 성격입니다. 로또 번호 선택에서도 꼼꼼하게 분석하고 신중하게 결정합니다. 한번 정한 번호를 오래 유지하는 고정수 전략에 강하며, 통계 기반 접근이 잘 맞습니다. 한국인의 약 34%가 A형입니다.',
    strategy: '통계 분석 후 고정수 전략을 추천합니다. 최근 50회차 출현 빈도를 분석하고, 자주 나온 번호 3개 + 오래 안 나온 번호 3개를 조합하세요. A형의 꼼꼼함이 최적의 조합을 찾아줍니다.',
    luckyNumbers: [3, 12, 21, 28, 35, 44],
    avoidNumbers: [7, 19, 38],
    bestPairId: 'o',
    worstPairId: 'b',
    purchaseTip: '매주 같은 요일, 같은 매장에서 구매하세요. A형은 루틴에서 행운이 옵니다.',
    percentage: '34%',
    faqs: [
      { question: 'A형에게 어울리는 로또 구매 전략은?', answer: 'A형은 체계적이고 분석적인 접근이 가장 잘 맞습니다. 출현 빈도 통계를 확인하고, 홀짝 비율 3:3, 합계 100~170 범위의 번호를 선택하세요. 한번 정한 번호를 최소 8주 유지하는 고정수 전략이 A형의 인내심과 잘 어울립니다.' },
      { question: 'A형의 로또 행운 시간대는?', answer: 'A형은 오전 시간대(10~12시)에 가장 직감이 정확합니다. 머리가 맑고 집중력이 높을 때 번호를 선택하면 당첨 확률이 올라갑니다.' },
    ],
  },
  {
    id: 'b',
    name: 'B형',
    emoji: '🅱️',
    trait: '자유롭고 창의적인 모험가',
    description: 'B형은 자유로운 영혼의 소유자입니다. 틀에 얽매이지 않는 창의적인 번호 선택을 즐기며, 매번 다른 번호를 고르는 것을 좋아합니다. 직감이 뛰어나고, 남들이 선택하지 않는 번호에서 대박이 터질 가능성이 높습니다.',
    strategy: '직감을 믿고 매주 새로운 번호를 선택하세요. B형은 변화에서 행운이 옵니다. 자동번호와 수동번호를 반반 섞는 하이브리드 전략도 좋습니다.',
    luckyNumbers: [5, 14, 22, 31, 37, 43],
    avoidNumbers: [2, 16, 40],
    bestPairId: 'ab',
    worstPairId: 'a',
    purchaseTip: '기분이 좋을 때 충동적으로 구매하세요. B형은 계획보다 직감이 더 정확합니다.',
    percentage: '27%',
    faqs: [
      { question: 'B형의 직감 로또 전략은?', answer: 'B형은 12혈액형 중 직감이 가장 뛰어납니다. 복권 판매점에서 번호판을 보고 3초 안에 눈에 들어오는 번호를 선택하세요. 오래 고민하면 오히려 직감이 흐려집니다. 자동번호 3장 + 직감번호 2장의 조합이 B형 최적 전략입니다.' },
      { question: 'B형이 로또를 살 때 피해야 할 것은?', answer: '남의 번호를 따라하지 마세요. B형의 행운은 독자적인 선택에서 옵니다. 커뮤니티 인기번호, 지인 추천번호보다 자신만의 번호가 당첨 에너지가 훨씬 강합니다.' },
    ],
  },
  {
    id: 'o',
    name: 'O형',
    emoji: '🅾️',
    trait: '리더십 강하고 대범한 승부사',
    description: 'O형은 대범하고 결단력 있는 성격입니다. 로또에서도 과감한 선택을 하며, 1등 아니면 안 산다는 마인드를 가지고 있습니다. 사교성이 좋아 공동구매에서 특히 행운이 따릅니다. 한국인의 약 28%가 O형입니다.',
    strategy: '공동구매를 적극 활용하세요! O형의 리더십이 팀의 행운을 끌어올립니다. 단독 구매 시에는 큰 숫자(30~45) 위주로 과감하게 선택하세요.',
    luckyNumbers: [1, 10, 19, 27, 36, 45],
    avoidNumbers: [8, 23, 34],
    bestPairId: 'a',
    worstPairId: 'ab',
    purchaseTip: '주말에 친구들과 함께 구매하세요. O형은 사람들과 함께할 때 행운이 극대화됩니다.',
    percentage: '28%',
    faqs: [
      { question: 'O형의 공동구매 전략은?', answer: 'O형은 공동구매에서 자연스럽게 리더 역할을 맡게 됩니다. 3~5명이 모여 각자 2개씩 번호를 추천하고, O형이 최종 조합을 결정하면 팀 전체의 행운이 상승합니다. O형+A형 조합이 가장 좋습니다.' },
      { question: 'O형의 로또 행운 장소는?', answer: 'O형은 사람이 많은 활기찬 장소에서 행운이 강합니다. 대형 마트 복권 코너, 번화가의 복권 전문점에서 구매하면 사람들의 긍정 에너지가 O형의 행운을 증폭시킵니다.' },
    ],
  },
  {
    id: 'ab',
    name: 'AB형',
    emoji: '🆎',
    trait: '독특하고 다면적인 천재형',
    description: 'AB형은 A형의 분석력과 B형의 직감을 동시에 가진 희귀한 혈액형입니다. 로또에서도 독특한 자신만의 방법으로 번호를 선택하며, 남들이 이해하지 못하는 패턴을 찾아냅니다. 한국인의 약 11%로 가장 희귀합니다.',
    strategy: '분석과 직감을 번갈아 사용하세요. 홀수 주에는 통계 기반, 짝수 주에는 완전 직감으로 선택합니다. AB형의 이중적 에너지가 두 전략 모두에서 빛납니다.',
    luckyNumbers: [4, 11, 20, 29, 33, 41],
    avoidNumbers: [6, 25, 44],
    bestPairId: 'b',
    worstPairId: 'o',
    purchaseTip: '혼자만의 시간에 조용히 구매하세요. AB형은 고요한 집중에서 최고의 직감이 나옵니다.',
    percentage: '11%',
    faqs: [
      { question: 'AB형의 독특한 번호 선택법은?', answer: 'AB형만의 홀짝주 교차 전략이 효과적입니다. 홀수 주차(1주, 3주, 5주)에는 통계 분석 기반으로, 짝수 주차(2주, 4주)에는 완전 직감으로 번호를 선택하세요. A형과 B형의 에너지를 번갈아 활용하는 전략입니다.' },
      { question: 'AB형이 가장 행운이 강한 시기는?', answer: 'AB형은 계절이 바뀌는 시기(3월, 6월, 9월, 12월)에 금전운이 상승합니다. 특히 봄가을 환절기에 직감이 가장 예민해지므로, 이 시기에 구매하면 당첨 확률이 올라갑니다.' },
    ],
  },
];

export function getBloodTypeProfile(id: string): BloodTypeProfile | undefined {
  return BLOOD_TYPE_PROFILES.find(p => p.id === id.toLowerCase());
}

/**
 * 복권 당첨금 세후 실수령액 계산 (1인 기준, 원천징수)
 *
 * 근거 (2026-10 확인):
 *  - 소득세법 제84조 제2호: 복권 당첨금이 건별 200만원 이하면 과세하지 않음 (2023년부터 5만원 → 200만원)
 *    https://www.law.go.kr/법령/소득세법/제84조
 *  - 소득세법 제129조 제1항 제6호: 기타소득 원천징수세율 20%, 복권 당첨금 중 3억원 초과분은 30%
 *    https://www.law.go.kr/법령/소득세법/제129조
 *  - 국세청 기타소득 원천징수 안내: "복권 당첨금 … 소득금액이 3억원을 초과하는 경우 30%"
 *    https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7893
 *  - 지방소득세법 제103조의3: 개인지방소득세 = 소득세의 10% → 실효세율 22% / 33%
 *
 * 구입비(1게임 1,000원) 필요경비 공제는 반영하지 않아 실제 지급액과 수백 원 차이가 날 수 있다
 * (/lotto/calculator 와 같은 방식).
 */

export const TAX_FREE_LIMIT = 2_000_000;
export const HIGH_BRACKET_THRESHOLD = 300_000_000;

export interface NetPrize {
  gross: number;
  incomeTax: number;
  localTax: number;
  totalTax: number;
  net: number;
}

export function calculateNetPrize(gross: number): NetPrize {
  const amount = Math.max(0, Math.floor(gross || 0));
  if (amount <= TAX_FREE_LIMIT) {
    return { gross: amount, incomeTax: 0, localTax: 0, totalTax: 0, net: amount };
  }
  const base = Math.min(amount, HIGH_BRACKET_THRESHOLD);
  const over = Math.max(0, amount - HIGH_BRACKET_THRESHOLD);
  const incomeTax = Math.floor(base * 0.2) + Math.floor(over * 0.3);
  const localTax = Math.floor(incomeTax * 0.1);
  const totalTax = incomeTax + localTax;
  return { gross: amount, incomeTax, localTax, totalTax, net: amount - totalTax };
}

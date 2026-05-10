/**
 * US Lottery static data — Powerball & Mega Millions
 * Sources: official rules from powerball.com / megamillions.com
 *
 * Used by /app/us/* English-market pages.
 */

export type GameKey = 'powerball' | 'mega-millions';

export interface GameRules {
  key: GameKey;
  displayName: string;
  ticketPrice: number;
  mainPick: { count: number; max: number };
  bonusPick: { count: number; max: number; label: string };
  drawDays: string[];
  drawTimeET: string;
  jackpotMin: number;
  drawingsAuthority: string;
  officialUrl: string;
}

export const POWERBALL: GameRules = {
  key: 'powerball',
  displayName: 'Powerball',
  ticketPrice: 2,
  mainPick: { count: 5, max: 69 },
  bonusPick: { count: 1, max: 26, label: 'Powerball' },
  drawDays: ['Monday', 'Wednesday', 'Saturday'],
  drawTimeET: '10:59 PM ET',
  jackpotMin: 20_000_000,
  drawingsAuthority: 'Multi-State Lottery Association (MUSL)',
  officialUrl: 'https://www.powerball.com',
};

export const MEGA_MILLIONS: GameRules = {
  key: 'mega-millions',
  displayName: 'Mega Millions',
  ticketPrice: 5,
  mainPick: { count: 5, max: 70 },
  bonusPick: { count: 1, max: 24, label: 'Mega Ball' },
  drawDays: ['Tuesday', 'Friday'],
  drawTimeET: '11:00 PM ET',
  jackpotMin: 50_000_000,
  drawingsAuthority: 'Mega Millions Consortium',
  officialUrl: 'https://www.megamillions.com',
};

export interface PrizeTier {
  match: string;
  prize: string;
  oddsOneIn: number;
}

export const POWERBALL_PRIZES: PrizeTier[] = [
  { match: '5 + Powerball', prize: 'Jackpot', oddsOneIn: 292_201_338 },
  { match: '5 (no Powerball)', prize: '$1,000,000', oddsOneIn: 11_688_054 },
  { match: '4 + Powerball', prize: '$50,000', oddsOneIn: 913_129 },
  { match: '4 (no Powerball)', prize: '$100', oddsOneIn: 36_525 },
  { match: '3 + Powerball', prize: '$100', oddsOneIn: 14_494 },
  { match: '3 (no Powerball)', prize: '$7', oddsOneIn: 580 },
  { match: '2 + Powerball', prize: '$7', oddsOneIn: 701 },
  { match: '1 + Powerball', prize: '$4', oddsOneIn: 92 },
  { match: '0 + Powerball', prize: '$4', oddsOneIn: 38 },
];

export const POWERBALL_OVERALL_ODDS = '1 in 24.87';

export const MEGA_MILLIONS_PRIZES: PrizeTier[] = [
  { match: '5 + Mega Ball', prize: 'Jackpot', oddsOneIn: 290_472_336 },
  { match: '5 (no Mega Ball)', prize: '$1,000,000', oddsOneIn: 12_607_306 },
  { match: '4 + Mega Ball', prize: '$10,000', oddsOneIn: 931_001 },
  { match: '4 (no Mega Ball)', prize: '$500', oddsOneIn: 38_792 },
  { match: '3 + Mega Ball', prize: '$200', oddsOneIn: 14_547 },
  { match: '3 (no Mega Ball)', prize: '$10', oddsOneIn: 606 },
  { match: '2 + Mega Ball', prize: '$10', oddsOneIn: 693 },
  { match: '1 + Mega Ball', prize: '$7', oddsOneIn: 89 },
  { match: '0 + Mega Ball', prize: '$5', oddsOneIn: 37 },
];

export const MEGA_MILLIONS_OVERALL_ODDS = '1 in 23';

export const FAQ_POWERBALL = [
  {
    q: 'How do you play Powerball?',
    a: 'Pick 5 numbers from 1–69 (white balls) and 1 number from 1–26 (the red Powerball). Match all 6 to win the jackpot. Tickets cost $2 each, and the Power Play multiplier is an optional $1 add-on that multiplies non-jackpot prizes.',
  },
  {
    q: 'When are Powerball drawings held?',
    a: 'Powerball is drawn three times a week — Monday, Wednesday, and Saturday at 10:59 PM Eastern Time. Cut-off times for ticket sales vary by jurisdiction (typically 1–2 hours before the drawing).',
  },
  {
    q: 'What are the odds of winning the Powerball jackpot?',
    a: 'The odds of winning the Powerball jackpot are 1 in 292,201,338. The overall odds of winning any prize are approximately 1 in 24.87.',
  },
  {
    q: 'How much tax will I pay if I win Powerball?',
    a: 'Federal tax withholding on US lottery winnings over $5,000 is 24% (an additional federal income tax may apply at filing, up to 37% top bracket). State taxes vary from 0% (states like Florida, Texas) to over 8% (New York). Many winners take the lump sum (~52% of advertised jackpot) instead of the 30-year annuity.',
  },
];

export const FAQ_MEGA_MILLIONS = [
  {
    q: 'How do you play Mega Millions?',
    a: 'Pick 5 numbers from 1–70 (white balls) and 1 number from 1–25 (the gold Mega Ball). Match all 6 to win the jackpot. As of April 2025, tickets cost $5 each and include a built-in multiplier on non-jackpot prizes.',
  },
  {
    q: 'When are Mega Millions drawings held?',
    a: 'Mega Millions drawings are held Tuesday and Friday nights at 11:00 PM Eastern Time. Sales close 15 minutes to 1 hour before the drawing depending on the state.',
  },
  {
    q: 'What are the odds of winning the Mega Millions jackpot?',
    a: 'The odds of winning the Mega Millions jackpot are 1 in 290,472,336. The overall odds of winning any prize are approximately 1 in 23.',
  },
  {
    q: 'Lump sum or annuity — which is better for Mega Millions?',
    a: 'The lump sum cash option pays roughly 50–55% of the advertised annuity value but is paid immediately. The 30-year annuity pays the full advertised amount across 30 graduated annual payments. Most jackpot winners choose the lump sum for investment flexibility, but the choice depends on personal tax planning.',
  },
];

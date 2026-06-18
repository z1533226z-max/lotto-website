/**
 * US English market guide articles — long-tail SEO content for /us/guide/[slug]
 * Source for /us/guide/* pages. No live data dependency.
 */

export interface UsGuideSection {
  heading: string;
  content: string;
}

export interface UsGuideFAQ {
  question: string;
  answer: string;
}

export type UsGuideCategory = 'Strategy' | 'Payouts' | 'Odds' | 'Compare' | 'Taxes' | 'Mechanics';

export interface UsGuideArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: UsGuideCategory;
  game: 'powerball' | 'mega-millions' | 'both';
  sections: UsGuideSection[];
  faqs: UsGuideFAQ[];
  relatedSlugs: string[];
  /** ISO 8601. Falls back to GUIDE_PUBLISHED_DATE when omitted. */
  datePublished?: string;
  /** ISO 8601. Falls back to GUIDE_UPDATED_DATE when omitted. */
  dateModified?: string;
}

/**
 * E-E-A-T / freshness signals shared across the /us/guide articles.
 * Articles were first published together; bump GUIDE_UPDATED_DATE whenever the
 * guide content is meaningfully revised so Article schema reflects real freshness.
 */
export const GUIDE_PUBLISHED_DATE = '2026-05-25T09:00:00+09:00';
export const GUIDE_UPDATED_DATE = '2026-06-18T09:00:00+09:00';

export const GUIDE_AUTHOR = {
  name: 'Lotto.Gon Editorial Team',
  url: 'https://lotto.gon.ai.kr/us',
} as const;

export const US_GUIDE_ARTICLES: UsGuideArticle[] = [
  {
    slug: 'powerball-strategy',
    title: 'Powerball Strategy: 7 Statistically Grounded Tips',
    metaTitle: 'Powerball Strategy — 7 Statistically Grounded Tips That Actually Help',
    metaDescription:
      'Honest Powerball strategy guide. What math says about hot numbers, pooling, ticket count, Power Play, and avoiding common picks that split jackpots.',
    category: 'Strategy',
    game: 'powerball',
    sections: [
      {
        heading: 'The honest baseline: no strategy changes the odds',
        content:
          'Every Powerball drawing is independent. The odds of hitting the jackpot are 1 in 292,201,338 on every single ticket, regardless of which numbers you pick or how often you play. Strategy cannot raise your win probability per dollar — only buying more tickets can, and even that scales linearly while cost scales identically. So the real question is not "how do I win" but "if I do win, how do I maximize what I keep and avoid splitting the prize."',
      },
      {
        heading: 'Tip 1 — Avoid the obvious patterns that get co-picked',
        content:
          'Roughly 70-80% of US lottery players choose at least one number connected to a birthday, anniversary, or street address. That concentrates picks in 1-31. If your jackpot ticket has 5 numbers all in the 1-31 range, you are more likely to split the prize with multiple other winners. Spreading picks above 31 (and avoiding the 1-2-3-4-5-6 / "lucky 7" sequences) doesn\'t raise your odds of winning, but it raises your expected payout if you do.',
      },
      {
        heading: 'Tip 2 — Pool with coworkers or friends (with a written agreement)',
        content:
          'A 50-person pool buying 50 tickets has 50x the chance of any ticket winning, while each person only spends $2 instead of $100. The downside is splitting the prize. The smart structure is a written pool agreement listing every member, ticket numbers, and prize-split rules before drawings. Many of the largest Powerball wins on record have been pools (the 2016 $1.586B jackpot included a 20-person California pool share). Verbal pools have caused multiple lawsuits — always document.',
      },
      {
        heading: 'Tip 3 — Buy tickets when the jackpot is high (but not too high)',
        content:
          'Mathematically, the expected value of a Powerball ticket rises with the jackpot. At a $20M starting jackpot, expected value is far below the $2 ticket price. At jackpots above roughly $400M (cash value, after tax), expected value can theoretically exceed the cost — but only if you ignore the increased ticket sales that raise split-the-pot risk. A 2018 study by economists at Vanderbilt found jackpots above $700M tend to attract enough casual buyers that the split-adjusted EV drops back below break-even.',
      },
      {
        heading: 'Tip 4 — Power Play: only worth it for non-jackpot prizes',
        content:
          'The $1 Power Play add-on multiplies non-jackpot prizes by 2x-10x. The $1M match-5 prize doubles to $2M only when the published multiplier is 2x or higher (the 10x multiplier never applies to the $1M tier — it caps at 2x). For lower-tier prizes (Match 3+PB, Match 4, etc.), Power Play has positive expected value when the announced multiplier is 5x or 10x. For most drawings, Power Play is a small negative-EV bet for non-jackpot tiers.',
      },
      {
        heading: 'Tip 5 — Don\'t chase past numbers (the gambler\'s fallacy)',
        content:
          'Numbers that haven\'t come up in months are not "due." The balls have no memory; each draw is independent. The same applies in reverse — recent "hot" numbers are not more likely to repeat. Picking based on frequency tables is harmless if you find it fun, but it doesn\'t shift the odds. See our /us/guide/powerball-most-common-numbers page for why frequency analysis is statistically meaningless for prediction.',
      },
      {
        heading: 'Tip 6 — Always sign your ticket immediately',
        content:
          'Powerball tickets are bearer instruments — whoever holds and signs them owns the prize. Sign the back of every ticket the moment you buy it. Store winning tickets in a safe-deposit box, not at home. Most lost-jackpot horror stories involve unsigned tickets that the original buyer cannot prove they purchased. This is not strategy in the math sense, but it is the single highest-impact action if you ever do win.',
      },
      {
        heading: 'Tip 7 — Set a fixed weekly budget',
        content:
          'The single most important "strategy" is one no math can replace: cap your weekly spend at an amount that has zero impact on your finances if it disappears. A $5/week Powerball habit is $260/year — entertainment money. A $50/week habit is $2,600/year, and the same EV-negative math applies to every dollar. Decide your weekly cap before drawings, not during.',
      },
    ],
    faqs: [
      {
        question: 'Are there really proven Powerball strategies that increase the chance of winning?',
        answer:
          'No. The drawings are random and independent, so no number selection strategy raises your per-ticket odds above 1 in 292,201,338 for the jackpot. The only way to increase your raw chance of winning is to buy more tickets. Strategies can only improve what you do with a win (avoid splitting, claim properly, taxes).',
      },
      {
        question: 'Is buying more tickets actually worth it?',
        answer:
          'Mathematically, your odds rise linearly with ticket count, but so does your cost. Five tickets give you 5/292,201,338 odds at a cost of $10. Pooling is the most efficient way to buy more tickets while controlling personal spend.',
      },
      {
        question: 'Do "lucky" stores sell more winning tickets?',
        answer:
          'Stores that sell high volumes will produce more winners simply by selling more tickets — there is no skill or location-based advantage. The "lucky store" effect is a statistical artifact of ticket volume, not store-specific luck.',
      },
      {
        question: 'When is the best time to buy a Powerball ticket?',
        answer:
          'Mathematically the best buys are when the jackpot is high enough that expected value approaches positive territory (typically above $400M cash value), but before national media coverage drives split-the-pot risk too high (typically above $700M).',
      },
    ],
    relatedSlugs: ['powerball-quick-pick-vs-self-pick', 'powerball-most-common-numbers', 'power-play-explained'],
  },
  {
    slug: 'powerball-vs-mega-millions',
    title: 'Powerball vs Mega Millions: Which Game Has Better Odds?',
    metaTitle: 'Powerball vs Mega Millions — Odds, Jackpots, and Which Is Better in 2026',
    metaDescription:
      'Head-to-head comparison of Powerball and Mega Millions: jackpot odds, overall odds, ticket prices, payout structure, and which game offers better expected value.',
    category: 'Compare',
    game: 'both',
    sections: [
      {
        heading: 'The headline numbers',
        content:
          'Powerball: 5/69 + 1/26, $2 per ticket, jackpot starts at $20M, drawings Mon/Wed/Sat. Jackpot odds: 1 in 292,201,338. Mega Millions: 5/70 + 1/24, $5 per ticket, jackpot starts at $50M, drawings Tue/Fri. Jackpot odds: 1 in 290,472,336. On the headline jackpot odds, Mega Millions is fractionally better (~0.6% lower denominator), but the $5 ticket price means each Powerball dollar buys 2.5x more jackpot exposure.',
      },
      {
        heading: 'Overall odds of winning any prize',
        content:
          'Powerball overall odds: approximately 1 in 24.87. Mega Millions overall odds: approximately 1 in 23. Mega Millions has slightly better any-prize odds because the April 2025 redesign added a built-in multiplier and tightened the prize structure. However, "any prize" mostly means $4-$10 wins, so this difference is mostly cosmetic — the real money is always in the top tiers.',
      },
      {
        heading: 'Jackpot growth and starting amounts',
        content:
          'Mega Millions starts at $50M minimum, Powerball at $20M. Mega Millions raised its starting jackpot in 2025 as part of its price hike. That said, Powerball has historically grown larger top jackpots due to its three-drawings-per-week schedule and lower ticket price (more rollover frequency, more buyer volume). The largest US lottery jackpot ever was a Powerball drawing ($2.04B, November 2022).',
      },
      {
        heading: 'Expected value at standard jackpot levels',
        content:
          'At minimum jackpots, both games have heavily negative expected value (around -$1.40 EV on a $2 Powerball ticket, around -$3.30 EV on a $5 Mega Millions ticket). Mega Millions needs a far higher jackpot to break even on EV because the $5 ticket cost is so much larger. Per dollar of EV improvement as jackpots grow, Powerball is more efficient.',
      },
      {
        heading: 'Cash option percentage',
        content:
          'Both games offer a lump-sum cash option that pays roughly 50-55% of the advertised annuity jackpot. The exact percentage shifts with interest rates — when long-term Treasury rates are higher, the cash percentage drops because the annuity stream is worth less in present value. As of mid-2026, both games\' cash options have been running at approximately 50-52% of advertised jackpots.',
      },
      {
        heading: 'Which to play: a practical recommendation',
        content:
          'If you want maximum exposure per dollar and don\'t care about marginally better any-prize odds, play Powerball ($2 vs $5 matters). If you want the slightly better overall any-prize odds and the per-game thrill of a more expensive ticket, Mega Millions is reasonable. If you have a fixed weekly budget (recommended), you can buy roughly 2.5 Powerball tickets per Mega Millions ticket — which most casual players will find more exciting and entertaining.',
      },
    ],
    faqs: [
      {
        question: 'Are Powerball and Mega Millions run by the same organization?',
        answer:
          'No. Powerball is operated by the Multi-State Lottery Association (MUSL). Mega Millions is operated by the Mega Millions Consortium. Both are agreements between participating state lotteries, but they are separate organizations and games.',
      },
      {
        question: 'Has anyone ever won both Powerball and Mega Millions jackpots?',
        answer:
          'No documented case of a single person winning both top jackpots. There have been multiple cases of people winning two large prizes from the same game years apart.',
      },
      {
        question: 'Which has better second-tier prizes?',
        answer:
          'Both games award $1M for matching the 5 white balls without the bonus ball. Powerball\'s 1 in 11.7M odds for this tier are slightly better than Mega Millions\' 1 in 12.6M.',
      },
      {
        question: 'Can I play both in the same week?',
        answer:
          'Yes. Powerball draws Monday, Wednesday, Saturday. Mega Millions draws Tuesday and Friday. A player can buy tickets for all 5 drawings in a week. Combined cost: $20+ per week at minimum 1 ticket each.',
      },
    ],
    relatedSlugs: ['powerball-strategy', 'mega-millions-strategy', 'lottery-tax-by-state'],
  },
  {
    slug: 'powerball-quick-pick-vs-self-pick',
    title: 'Quick Pick vs Self-Pick: Which Wins More Powerball Jackpots?',
    metaTitle: 'Quick Pick vs Self-Pick Powerball — What the Data Actually Shows',
    metaDescription:
      'Are Powerball Quick Picks really better than self-picked numbers? We examine the published win data, why Quick Picks dominate, and what the math really says.',
    category: 'Strategy',
    game: 'powerball',
    sections: [
      {
        heading: 'What the historical Powerball jackpot data shows',
        content:
          'Powerball publicly reports the purchase method (Quick Pick or self-pick) of each jackpot winner. Across the last decade of jackpots, approximately 70-75% of winning tickets were Quick Picks. This is the source of the widespread belief that Quick Picks "win more often."',
      },
      {
        heading: 'Why Quick Picks dominate — it\'s not skill, it\'s share',
        content:
          'The reason Quick Picks win 70-75% of jackpots is that 70-80% of all Powerball tickets sold are Quick Picks. If Quick Picks make up 75% of tickets and 75% of winners, the underlying win rate per ticket is identical. The "Quick Picks win more" claim is a base-rate fallacy — comparing winners without normalizing by ticket share.',
      },
      {
        heading: 'The mathematical truth',
        content:
          'A Quick Pick and a self-picked ticket have exactly the same 1 in 292,201,338 odds of hitting the jackpot. The random number generator at the terminal and a human picker are both choosing from the same pool of 292M+ combinations. There is no difference in win probability.',
      },
      {
        heading: 'Where Quick Pick may have a real advantage: avoiding splits',
        content:
          'If self-pickers concentrate on dates (1-31), low numbers, and lucky sequences, then Quick Picks are slightly less likely to produce a winning ticket that gets split with another winner. The random distribution covers the full 1-69 range evenly. So conditional on winning, Quick Pick winners are marginally more likely to be sole winners — not because they win more often, but because they share less.',
      },
      {
        heading: 'When self-pick makes sense',
        content:
          'Self-pick is the right choice if (1) you derive entertainment value from picking your own numbers, (2) you want to avoid the most-co-picked combinations using a deliberate spread above 31, or (3) you play the same numbers every week and would feel bad if "your" numbers came up on a week you skipped. Self-pick costs nothing extra at the terminal.',
      },
    ],
    faqs: [
      {
        question: 'Are Quick Picks rigged in any way?',
        answer:
          'No. State lotteries are independently audited, and the random number generators at terminals are tested. The Quick Pick win rate matches what statistics predicts given the share of tickets sold as Quick Picks.',
      },
      {
        question: 'Can I get a list of "winning" Quick Pick numbers?',
        answer:
          'Past winning numbers are publicly available on Powerball.com. But because each drawing is independent, past Quick Pick winners have no predictive value for future drawings.',
      },
      {
        question: 'Should I keep playing the same numbers every week?',
        answer:
          'It is a personal preference. Mathematically, every set of 6 numbers has identical odds. The risk of "your" numbers winning on a week you skipped is real — but so is the cost of playing every drawing for years. Set a budget either way.',
      },
    ],
    relatedSlugs: ['powerball-strategy', 'powerball-most-common-numbers', 'power-play-explained'],
  },
  {
    slug: 'powerball-annuity-vs-lump-sum',
    title: 'Powerball Annuity vs Lump Sum: Which Payout Should You Take?',
    metaTitle: 'Powerball Annuity vs Lump Sum — Which Is Smarter in 2026',
    metaDescription:
      'Powerball winners can choose 30-year annuity or immediate cash. We break down the math, taxes, investment trade-offs, and what most jackpot winners actually pick.',
    category: 'Payouts',
    game: 'powerball',
    sections: [
      {
        heading: 'The two options explained',
        content:
          'When you win a Powerball jackpot, you choose between (1) the annuity: 30 graduated annual payments starting immediately, each 5% larger than the previous, totaling the full advertised jackpot before tax, or (2) the lump-sum cash option: a one-time payment equal to the present cash value of the annuity, typically 50-55% of the advertised jackpot.',
      },
      {
        heading: 'Why the cash option is roughly half',
        content:
          'The advertised jackpot is the total of 30 graduated payments. The cash option is what it would cost the lottery to purchase a portfolio of government bonds that would produce that 30-year payment stream. Because future payments are discounted to present value at prevailing Treasury rates, the cash amount is far lower than the headline. At a $700M advertised jackpot, the cash option is typically $350-385M.',
      },
      {
        heading: 'Tax treatment: identical rates, different timing',
        content:
          'Federal tax withholding is 24% on payouts over $5,000, and at year-end you owe up to 37% top marginal rate on the lottery income. With the lump sum, the entire amount hits your tax return in one year (almost certainly the top bracket). With the annuity, only the annual payment hits each year — but each payment is still large enough to land in the top bracket. So the rate is effectively the same; only the timing differs.',
      },
      {
        heading: 'State tax variation',
        content:
          'State withholding ranges from 0% (Florida, Texas, Tennessee, Washington, South Dakota, New Hampshire, Wyoming) to 8.82% (New York). With the annuity, if you move to a no-tax state mid-stream, only future payments are spared state tax (and your former state may attempt to claim residual taxes). With the lump sum, you pay state tax once based on the state in which you bought the ticket and your state of residence.',
      },
      {
        heading: 'The investment math',
        content:
          'A common argument for lump sum: invest at 7% annual return and the lump sum grows beyond the annuity. The counter-argument: lottery winners statistically struggle with sudden wealth management, and the annuity acts as a structural discipline. Studies suggest 30-70% of large lottery winners file for bankruptcy within 5 years. The "invest the lump sum" math requires sustained discipline most winners do not have.',
      },
      {
        heading: 'Which most winners actually choose',
        content:
          'Approximately 90-95% of US lottery jackpot winners choose the lump sum. Reasons: immediate access to wealth, ability to invest aggressively, fear of dying before the 30-year stream completes (annuity does continue to estate, but with complexity), and the simple psychological pull of "all the money now."',
      },
    ],
    faqs: [
      {
        question: 'Can my heirs continue receiving annuity payments if I die?',
        answer:
          'Yes. Powerball annuity payments continue to your estate per the original 30-year schedule. The remaining payments can typically be inherited by named beneficiaries, though state rules and estate tax implications vary.',
      },
      {
        question: 'Can I change my mind after picking annuity?',
        answer:
          'No. The choice is final at claim time and typically must be declared within 60 days of presenting the winning ticket. Some states allow a single one-time conversion to lump sum within 60 days, but this is jurisdiction-specific.',
      },
      {
        question: 'Is there a way to take some as annuity and some as lump sum?',
        answer:
          'Not for the main jackpot itself. However, you could take the lump sum and self-construct an annuity by purchasing a high-grade bond ladder or a private annuity from an insurance company.',
      },
      {
        question: 'Do annuity payments grow with inflation?',
        answer:
          'Powerball annuity payments grow at a fixed 5% per year (not CPI-indexed). If long-run inflation runs hotter than 5%, real purchasing power of later payments declines.',
      },
    ],
    relatedSlugs: ['lottery-tax-by-state', 'powerball-vs-mega-millions', 'powerball-strategy'],
  },
  {
    slug: 'powerball-most-common-numbers',
    title: 'The Most Common Powerball Numbers (And Why It Doesn\'t Matter)',
    metaTitle: 'Most Common Powerball Numbers Drawn — And Why Frequency Analysis Is a Trap',
    metaDescription:
      'See the most commonly drawn Powerball numbers — and a clear explanation of why frequency analysis cannot predict future drawings. Includes the cold numbers, too.',
    category: 'Odds',
    game: 'powerball',
    sections: [
      {
        heading: 'What "hot" and "cold" numbers really mean',
        content:
          'A hot number is one that has been drawn more frequently than expected over a recent window (often the last 50 or 100 drawings). A cold number is the opposite — drawn less often than expected. Almost every lottery site publishes hot/cold tables because they get traffic. The data is real; the implication that it predicts future drawings is wrong.',
      },
      {
        heading: 'The math: independent events have no memory',
        content:
          'Each Powerball drawing is a fresh, independent random draw from the full pool (1-69 for the white balls, 1-26 for the Powerball). The physical drawing machines are inspected and balanced. The probability that any specific number is drawn on the next drawing is 5/69 = 7.25% for white balls, regardless of what came up last week or last year. "Due" numbers are the gambler\'s fallacy in pure form.',
      },
      {
        heading: 'Why frequency tables look meaningful (and aren\'t)',
        content:
          'In any random sample, some numbers will appear more often than others purely by chance. Over Powerball\'s 30+ year history, the white ball most drawn is typically around the 320-360 appearance count, the least drawn around 240-280. That spread looks meaningful but is exactly what statistics predicts for fair random draws across that many trials. Apply a chi-square test and the distribution passes as uniform.',
      },
      {
        heading: 'The only way frequency analysis can hurt you',
        content:
          'If you pick the most-drawn numbers because you think they will continue to be hot, your odds don\'t change. But many other players are doing the same — those numbers get more co-picks, which means if any of them does come up in your winning ticket, you\'re more likely to share the prize. Counter-intuitively, picking less-popular numbers (without choosing actual cold numbers) gives marginally higher expected payout conditional on winning.',
      },
      {
        heading: 'Better questions to ask',
        content:
          'Instead of "which numbers are due," consider: "What is the highest jackpot I would buy in at?" "How much can I spend weekly without affecting my finances?" "If I won, would I take annuity or lump sum?" "Do I have a written pool agreement with my coworkers?" These questions actually affect outcomes; number selection does not.',
      },
    ],
    faqs: [
      {
        question: 'What is the most drawn Powerball white ball number historically?',
        answer:
          'Across Powerball\'s history (since the current matrix was introduced in 2015), numbers like 32, 39, and 23 have been among the most frequently drawn white balls — typically appearing within a few percentage points of the expected average. The exact ranking shifts month to month and is statistically meaningless for predicting future drawings.',
      },
      {
        question: 'What is the most drawn red Powerball number?',
        answer:
          'Common high-frequency red balls include 18, 24, and 4 in recent years. With only 26 possible Powerball numbers and ~480 drawings since the 2015 matrix change, each red ball averages around 18-19 appearances. Frequency rankings change month to month.',
      },
      {
        question: 'If frequency does not predict, why do lottery sites publish it?',
        answer:
          'Because it draws traffic. "Most common Powerball numbers" is one of the highest-volume lottery searches in the United States. Sites publish the data because users want to see it — not because it improves win probability.',
      },
      {
        question: 'Are there any number-picking strategies that actually work?',
        answer:
          'No strategy raises your per-ticket odds of winning. The only "strategies" that affect expected value are those that influence whether you share a winning jackpot — primarily, picking numbers above 31 to avoid date-based clustering.',
      },
    ],
    relatedSlugs: ['powerball-strategy', 'powerball-quick-pick-vs-self-pick', 'powerball-vs-mega-millions'],
  },
  {
    slug: 'mega-millions-strategy',
    title: 'Mega Millions Strategy: Smart Ways to Play in 2026',
    metaTitle: 'Mega Millions Strategy — Smart Ways to Play After the 2025 Redesign',
    metaDescription:
      'Mega Millions strategy guide for the post-2025 $5 ticket era. Built-in multiplier impact, jackpot timing, pooling, and avoiding split-the-prize patterns.',
    category: 'Strategy',
    game: 'mega-millions',
    sections: [
      {
        heading: 'What changed in April 2025',
        content:
          'Mega Millions redesigned in April 2025: tickets went from $2 to $5, the Mega Ball pool dropped from 1-25 to 1-24, jackpot minimums rose to $50M, and a built-in multiplier was added to non-jackpot prizes (removing the optional Megaplier add-on). Result: better any-prize odds (about 1 in 23), worse per-dollar cost efficiency vs Powerball ($5 vs $2).',
      },
      {
        heading: 'Tip 1 — Treat each $5 ticket as 2.5 Powerball tickets',
        content:
          'For the same $5, you could buy 2.5 Powerball tickets. If your goal is maximum exposure per dollar, Powerball remains more efficient. If you specifically want Mega Millions\' marginally better any-prize odds and don\'t mind the lower jackpot exposure per dollar, Mega Millions makes sense.',
      },
      {
        heading: 'Tip 2 — Avoid 1-24 clustering on the Mega Ball',
        content:
          'The Mega Ball pool is only 1-24. Many casual players pick birthdays for the Mega Ball, which clusters around 1-12 (months) and 1-31 (capped at 24 for this pool). For better expected payout conditional on winning, spreading toward 19-24 reduces overlap with date pickers.',
      },
      {
        heading: 'Tip 3 — Pool buying scales especially well for Mega Millions',
        content:
          'Because the $5 ticket cost is high relative to per-ticket EV, pooling lets you maintain meaningful jackpot exposure without taking on individual cost. A 20-person Mega Millions pool spending $100 buys 20 tickets — each member contributes $5, the same as a single individual ticket, while getting 20x the jackpot exposure.',
      },
      {
        heading: 'Tip 4 — The built-in multiplier changes the EV calculation',
        content:
          'Mega Millions\' built-in multiplier (replacing the optional Megaplier) means every $5 ticket automatically has multiplied non-jackpot prizes. This shifts EV up for non-jackpot tiers compared to the pre-2025 game. It also means there is no "should I add Megaplier?" decision — it is included.',
      },
      {
        heading: 'Tip 5 — Set a per-drawing budget, not per-week',
        content:
          'With Mega Millions at $5 per ticket and two drawings weekly, casual players easily spend $20+/week without realizing it. A per-drawing budget ($5 or $10 per drawing) is easier to enforce than a per-week one.',
      },
    ],
    faqs: [
      {
        question: 'Is Mega Millions worth playing at minimum jackpot?',
        answer:
          'Mathematically, no — at the $50M minimum, expected value is heavily negative for a $5 ticket. Casual play for entertainment is fine at any jackpot; expected-value-positive buying only happens at very high jackpots, and even then only on paper before adjusting for split risk.',
      },
      {
        question: 'Did the 2025 redesign make winning easier or harder?',
        answer:
          'Easier for any-prize odds (1 in 23 vs the prior 1 in 24), and slightly easier for the jackpot (1 in 290.5M vs the prior 1 in 302.6M, due to the smaller Mega Ball pool). But the higher ticket cost ($5 vs $2) means per-dollar exposure is worse, so "easier per dollar" is not the right framing.',
      },
      {
        question: 'Are Mega Millions Quick Picks better than self-pick?',
        answer:
          'No. Same as Powerball: Quick Picks and self-picks have identical win probability. Quick Picks make up the majority of tickets, so they also make up the majority of winners — a base-rate effect, not skill.',
      },
      {
        question: 'Can I buy Mega Millions in California?',
        answer:
          'Yes. California is one of the 45 states that sells Mega Millions. California is unique in that all prize tiers are pari-mutuel — meaning prizes are calculated based on ticket sales and number of winners in California rather than fixed amounts.',
      },
    ],
    relatedSlugs: ['powerball-vs-mega-millions', 'powerball-strategy', 'lottery-tax-by-state'],
  },
  {
    slug: 'power-play-explained',
    title: 'Power Play Explained: Is the $1 Add-On Worth It?',
    metaTitle: 'Powerball Power Play Explained — When the $1 Add-On Is Actually Worth It',
    metaDescription:
      'Power Play multiplies non-jackpot Powerball prizes by 2x-10x for $1 extra. We break down when it has positive expected value and when it is a losing bet.',
    category: 'Mechanics',
    game: 'powerball',
    sections: [
      {
        heading: 'What Power Play does',
        content:
          'Power Play is an optional $1 add-on per ticket that multiplies non-jackpot prize amounts. The multiplier (2x, 3x, 4x, 5x, or 10x) is randomly determined for each drawing and announced before the main numbers are drawn. The 10x multiplier is only available when the advertised jackpot is under $150M. The Match-5 $1M prize is doubled to $2M with any Power Play multiplier — capped at 2x for that tier specifically.',
      },
      {
        heading: 'The math: positive EV only at 5x or 10x',
        content:
          'For lower-tier prizes (Match 3+PB at $100, Match 4 at $100, Match 3 at $7, etc.), the published probabilities and prize amounts make Power Play a positive expected value bet at 5x and especially 10x. At 2x and 3x, the $1 add-on cost typically exceeds the EV improvement, making it a small negative-EV bet. The 4x multiplier sits roughly at break-even.',
      },
      {
        heading: 'The Match-5 cap',
        content:
          'Many players assume the $1M Match-5 prize becomes $10M with the 10x multiplier. It does not. The Match-5 prize is capped at $2M (effectively 2x) regardless of the announced Power Play multiplier. This rule, buried in the fine print, is the single most important Power Play detail that most casual players miss.',
      },
      {
        heading: 'Power Play probabilities (published)',
        content:
          'According to Powerball\'s published rules, the multiplier distribution (when the 10x is available) is approximately: 2x 24/43, 3x 13/43, 4x 3/43, 5x 2/43, 10x 1/43. When the jackpot exceeds $150M and 10x is removed, the distribution becomes 2x 24/42, 3x 13/42, 4x 3/42, 5x 2/42.',
      },
      {
        heading: 'Practical decision rule',
        content:
          'If you play casually and only buy a few tickets per drawing, Power Play\'s small negative EV is essentially a rounding error — the $1 is entertainment cost. If you buy in volume or treat Powerball as an EV-conscious bet, skip Power Play except when the advertised jackpot is under $150M and 10x is in play.',
      },
    ],
    faqs: [
      {
        question: 'Is Power Play available on all Powerball tickets?',
        answer:
          'Yes, in all participating jurisdictions. Power Play is added by checking the Power Play box on your play slip (or asking the clerk) for an extra $1 per play.',
      },
      {
        question: 'Does Power Play affect the jackpot?',
        answer:
          'No. The advertised jackpot is unaffected by Power Play. Power Play only multiplies non-jackpot prize tiers (and even then, the Match-5 prize is capped at $2M).',
      },
      {
        question: 'Is Power Play available in California?',
        answer:
          'No. California does not offer Power Play because all California Powerball prizes are pari-mutuel (calculated based on ticket sales and number of winners), making a fixed multiplier incompatible with the state\'s lottery rules.',
      },
      {
        question: 'When is Power Play most worth buying?',
        answer:
          'When the advertised jackpot is under $150M (so the 10x multiplier is in play) and you are buying for the chance of a mid-tier prize. At lower multipliers, the $1 cost typically exceeds the EV improvement.',
      },
    ],
    relatedSlugs: ['powerball-strategy', 'powerball-quick-pick-vs-self-pick', 'powerball-most-common-numbers'],
  },
  {
    slug: 'lottery-tax-by-state',
    title: 'US Lottery Tax by State: Federal + State Withholding Explained',
    metaTitle: 'US Lottery Tax by State — Federal + State Withholding 2026 Guide',
    metaDescription:
      'Lottery winnings face federal and state taxes. We break down withholding rates by state, the 24% federal hit, top marginal rate, and the states with zero lottery tax.',
    category: 'Taxes',
    game: 'both',
    sections: [
      {
        heading: 'Federal tax on lottery winnings',
        content:
          'The IRS treats lottery winnings as ordinary income. For prizes over $5,000, the lottery withholds 24% federal income tax automatically. At year-end filing, the full prize is added to your taxable income, and you may owe up to 37% (the top federal marginal rate) after the 24% withholding. For large jackpots, the effective federal rate is essentially the full 37%.',
      },
      {
        heading: 'States with zero lottery income tax',
        content:
          'Eight states impose no state income tax on lottery winnings: Florida, Texas, Tennessee, Washington, South Dakota, New Hampshire, Wyoming, and California (California specifically exempts lottery winnings from its income tax, despite having a state income tax on other income). If you bought your ticket in any of these states, no state withholding applies.',
      },
      {
        heading: 'States with the highest lottery tax rates',
        content:
          'Top lottery tax states (state withholding on lottery prizes): New York 8.82% + NYC 3.876% additional for city residents (total over 12% in NYC), Maryland 8.95% (8.75% state + 0.2% local), New Jersey 8% on winnings over $500K, Oregon 8% on winnings over $125K, Wisconsin 7.65%, Minnesota 7.25%, Arkansas 7%, South Carolina 7%.',
      },
      {
        heading: 'The "non-resident state" complication',
        content:
          'You can be subject to state tax both in the state where you bought the ticket and in your state of residence (with a credit for taxes paid to the other state). This particularly matters for jackpot winners who travel to play. The cleanest setup tax-wise: buy your ticket in your home state if your home state has lottery tax, or in a no-tax state if your home state doesn\'t.',
      },
      {
        heading: 'Estimating your take-home',
        content:
          'A rough rule of thumb for a Powerball jackpot lump sum in a high-tax state: advertised jackpot × 0.50 (cash option) × 0.55 (after federal + state tax) ≈ 27-28% of the advertised number lands in your account. For a $700M advertised jackpot, that\'s roughly $190M-200M net. In a no-tax state like Florida, that figure rises to roughly $220M-230M net.',
      },
      {
        heading: 'Annuity vs lump-sum tax timing',
        content:
          'With the lump sum, all tax is owed in one year (essentially guaranteeing the top marginal rate). With the annuity, each annual payment lands in its own tax year — but each payment is still large enough to land in the top bracket for almost all winners. The total tax bill ends up roughly identical; only the timing differs. The annuity does, however, protect against future federal rate hikes — if rates rise after your win, future annuity payments are taxed at the new rates.',
      },
    ],
    faqs: [
      {
        question: 'Do I owe taxes if I win less than $5,000?',
        answer:
          'No federal tax is withheld on prizes under $5,000, but the IRS still treats the winnings as taxable income. You are required to report them on your tax return regardless of withholding.',
      },
      {
        question: 'Can I avoid taxes by gifting my winnings?',
        answer:
          'No. You owe income tax on the full winnings before any gifting. Gifts above the annual exclusion ($18,000 per recipient in 2026) reduce your lifetime gift/estate tax exemption ($13.61M in 2026), so large gifts have additional implications.',
      },
      {
        question: 'What if I win in one state but live in another?',
        answer:
          'You typically owe tax in both the state where you bought the ticket (if it taxes lottery winnings) and your state of residence (with a credit for tax paid to the other state). A tax attorney is strongly recommended for any large win.',
      },
      {
        question: 'Are there any legal ways to reduce my lottery tax bill?',
        answer:
          'Limited options exist: choose the annuity to spread taxable income across years (each year still in top bracket for most winners), donate to qualified charities to reduce taxable income, establish residency in a no-income-tax state before claiming. Consult a tax attorney before claiming any large prize.',
      },
    ],
    relatedSlugs: ['powerball-annuity-vs-lump-sum', 'powerball-vs-mega-millions', 'powerball-strategy'],
  },
];

export function getUsGuide(slug: string): UsGuideArticle | undefined {
  return US_GUIDE_ARTICLES.find(a => a.slug === slug);
}

export function getAllUsGuideSlugs(): string[] {
  return US_GUIDE_ARTICLES.map(a => a.slug);
}

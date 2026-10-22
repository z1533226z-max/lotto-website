import { Metadata } from 'next';
import Breadcrumb from '@/components/layout/Breadcrumb';
import MyNumbersManager from '@/components/lotto/MyNumbersManager';
import { getAllLottoData, getLatestRound } from '@/lib/dataFetcher';
import { getNextDraw } from '@/lib/drawSchedule';
import { formatKstDrawTime } from '@/lib/kstFormat';
import { DEFAULT_OG_IMAGES } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = '내 로또 번호 저장·당첨 자동 확인 (가입 없이) | 로또킹';
const DESCRIPTION = '가입 없이 로또 번호를 저장하면 토요일 추첨 후 몇 개 맞았는지, 몇 등인지 자동으로 보여 드립니다. 번호는 내 브라우저에만 저장됩니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://lotto.gon.ai.kr/lotto/my-numbers' },
  openGraph: {
    title: '내 로또 번호 저장·당첨 자동 확인',
    description: DESCRIPTION,
    url: 'https://lotto.gon.ai.kr/lotto/my-numbers',
    images: DEFAULT_OG_IMAGES,
  },
};

export default async function MyNumbersPage() {
  const allData = await getAllLottoData();
  const latest = getLatestRound(allData);
  const draws = allData.slice(-30).map(d => ({ round: d.round, numbers: d.numbers, bonusNumber: d.bonusNumber }));
  const next = getNextDraw();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '내 번호 당첨 확인' }]} />
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)' }}>
          내 로또 번호 저장 · 당첨 자동 확인
        </h1>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          이번 주에 산 번호나 받은 추천번호를 저장해 두세요. 다음 추첨은 <strong>{next.round}회</strong>(
          {formatKstDrawTime(next.drawTimeMs)})이며, 추첨 결과가 나오면 이 페이지와 회차 페이지에서 몇 개 맞았는지 바로 보여 드립니다.
          {latest && <> 가장 최근 결과는 <a href={`/lotto/${latest.round}`} className="text-primary hover:underline">{latest.round}회 당첨번호</a>입니다.</>}
        </p>
      </header>

      <MyNumbersManager draws={draws} latestRound={latest?.round ?? 0} nextRound={next.round} />

      <section className="text-xs leading-relaxed space-y-1" style={{ color: 'var(--text-tertiary)' }}>
        <p>· 등수 기준: 6개 일치 1등, 5개+보너스 2등, 5개 3등, 4개 4등(5만원), 3개 5등(5천원).</p>
        <p>· 당첨 확인은 참고용입니다. 실제 당첨 여부와 지급은 동행복권 발표와 복권 실물(또는 구매 내역)로 확인하세요.</p>
        <p>· 모든 번호 조합의 당첨 확률은 같으며(1등 8,145,060분의 1), 저장·추천이 확률을 바꾸지 않습니다.</p>
      </section>
    </div>
  );
}

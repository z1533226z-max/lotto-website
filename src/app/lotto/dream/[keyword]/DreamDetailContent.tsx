'use client';

import Link from 'next/link';
import LottoNumbers from '@/components/lotto/LottoNumbers';
import type { DreamKeyword } from '@/data/dreamNumbers';
import CrossSectionLinks from '@/components/lotto/CrossSectionLinks';

interface Props {
  dream: DreamKeyword;
  sameCategoryDreams: DreamKeyword[];
  allDreams: DreamKeyword[];
  categories: string[];
}

const categoryEmoji: Record<string, string> = {
  '동물': '🐾',
  '자연': '🌿',
  '사물': '📦',
  '행동': '🏃',
  '감정': '💭',
  '사람': '👤',
  '색깔': '🎨',
};

const fortuneLabel: Record<string, { text: string; color: string; bg: string }> = {
  '대길': { text: '대길 (大吉)', color: '#D36135', bg: 'rgba(211,97,53,0.15)' },
  '길': { text: '길 (吉)', color: '#3E5641', bg: 'rgba(62,86,65,0.15)' },
  '보통': { text: '보통', color: '#666', bg: 'rgba(102,102,102,0.1)' },
  '주의': { text: '주의', color: '#c00', bg: 'rgba(204,0,0,0.1)' },
};

export default function DreamDetailContent({ dream, sameCategoryDreams, allDreams, categories }: Props) {
  const fortune = fortuneLabel[dream.fortune] || fortuneLabel['보통'];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{categoryEmoji[dream.category] || '✨'}</div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {dream.keyword} 꿈해몽 로또번호
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-2">
          {dream.category} | 꿈해몽 번호 추천
        </p>
        {/* 길흉 뱃지 */}
        <span
          className="inline-block mt-3 px-4 py-1 rounded-full text-sm font-bold"
          style={{ backgroundColor: fortune.bg, color: fortune.color }}
        >
          {fortune.text}
        </span>
      </div>

      {/* 추천 번호 */}
      <div className="rounded-xl p-8 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">🎱 추천 로또번호</h2>
        <div className="flex justify-center mb-4">
          <LottoNumbers numbers={dream.numbers} size="lg" animated />
        </div>
        <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          {dream.keyword} 꿈에서 추천하는 번호입니다
        </p>
        <div className="flex justify-center gap-2 mt-3">
          {dream.numbers.map(n => (
            <Link
              key={n}
              href={`/lotto/number/${n}`}
              className="px-3 py-1 rounded-full text-xs hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#D36135', color: '#fff' }}
            >
              {n}번 상세분석 →
            </Link>
          ))}
        </div>
      </div>

      {/* 번호 연결 이유 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">🔗 왜 이 번호일까?</h2>
        <p className="leading-relaxed">{dream.numberReason}</p>
      </div>

      {/* 꿈해몽 상세 풀이 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📖 {dream.keyword} 꿈 상세 풀이</h2>
        <p className="leading-relaxed mb-4">{dream.description}</p>
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
          <h3 className="font-semibold mb-2">🔮 전통 해석</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {dream.interpretation}
          </p>
        </div>
      </div>

      {/* 꿈 활용 팁 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">💡 꿈 활용 팁</h2>
        <div className="space-y-3">
          <TipItem
            title="꿈을 꾸자마자 기록하세요"
            desc="꿈의 세부 내용은 기상 후 5분 이내에 80% 사라집니다. 핸드폰 메모에 바로 적어두세요."
          />
          <TipItem
            title="감정에 집중하세요"
            desc={`${dream.keyword} 꿈에서 느낀 감정이 긍정적이었다면 더 강한 길몽입니다. 부정적 감정이었다면 주의 신호일 수 있습니다.`}
          />
          <TipItem
            title="반복되는 꿈에 주목하세요"
            desc={`${dream.keyword} 꿈이 반복된다면 잠재의식이 강하게 보내는 메시지입니다. 이때 로또를 구매하면 적중률이 높아질 수 있습니다.`}
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">❓ 자주 묻는 질문</h2>
        <div className="space-y-4">
          <FaqItem
            q={`${dream.keyword} 꿈을 꾸면 로또번호는?`}
            a={`${dream.keyword} 꿈의 추천 로또번호는 ${dream.numbers.join(', ')}입니다. ${dream.description}`}
          />
          <FaqItem
            q={`${dream.keyword} 꿈은 무슨 뜻인가요?`}
            a={dream.interpretation}
          />
          <FaqItem
            q={`${dream.keyword} 꿈은 길몽인가요?`}
            a={`${dream.keyword} 꿈의 길흉 판단은 "${fortune.text}"입니다. ${dream.category} 카테고리에 속하며, ${dream.description}`}
          />
          <FaqItem
            q={`${dream.keyword} 꿈에서 추천 번호를 조합하는 방법은?`}
            a={`추천번호 ${dream.numbers.join(', ')}을 기본으로, 같은 ${dream.category} 카테고리의 다른 꿈 번호와 조합하면 효과적입니다. 여러 꿈을 꾸었다면 각 꿈의 번호를 모아 6개를 선택해 보세요.`}
          />
        </div>
      </div>

      {/* 같은 카테고리 */}
      {sameCategoryDreams.length > 0 && (
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold mb-4">
            {categoryEmoji[dream.category]} 같은 카테고리: {dream.category}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sameCategoryDreams.map(d => (
              <Link
                key={d.keyword}
                href={`/lotto/dream/${encodeURIComponent(d.keyword)}`}
                className="p-3 rounded-lg hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <div className="font-semibold mb-1">{d.keyword}</div>
                <div className="flex gap-1">
                  <LottoNumbers numbers={d.numbers} size="xs" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 관련 분석 페이지 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📊 관련 분석</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <LinkCard href="/lotto/statistics" icon="📈" title="번호 통계" />
          <LinkCard href={`/lotto/number/${dream.numbers[0]}`} icon="🔢" title={`${dream.numbers[0]}번 분석`} />
          <LinkCard href="/lotto/pattern/odd-even" icon="🔄" title="홀짝 패턴" />
          <LinkCard href="/lotto/dream" icon="🌙" title="전체 꿈번호" />
        </div>
      </div>

      {/* 전체 카테고리 */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-4">📂 전체 꿈해몽 카테고리</h2>
        {categories.map(cat => {
          const catDreams = allDreams.filter(d => d.category === cat);
          return (
            <div key={cat} className="mb-4">
              <h3 className="font-semibold mb-2">{categoryEmoji[cat]} {cat} ({catDreams.length}개)</h3>
              <div className="flex flex-wrap gap-2">
                {catDreams.map(d => (
                  <Link
                    key={d.keyword}
                    href={`/lotto/dream/${encodeURIComponent(d.keyword)}`}
                    className={`px-3 py-1 rounded-full text-sm transition-all hover:scale-105 ${d.keyword === dream.keyword ? 'font-bold' : ''}`}
                    style={{
                      backgroundColor: d.keyword === dream.keyword ? '#D36135' : 'var(--border)',
                      color: d.keyword === dream.keyword ? '#fff' : 'var(--text)',
                    }}
                  >
                    {d.keyword}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <CrossSectionLinks current="dream" theme="light" />
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>
      <h3 className="font-semibold mb-1">{q}</h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a}</p>
    </div>
  );
}

function TipItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  );
}

function LinkCard({ href, icon, title }: { href: string; icon: string; title: string }) {
  return (
    <Link
      href={href}
      className="p-3 rounded-lg text-center text-sm font-medium transition-all hover:opacity-80"
      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      <div className="text-xl mb-1">{icon}</div>
      {title}
    </Link>
  );
}

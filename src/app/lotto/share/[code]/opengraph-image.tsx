import { ImageResponse } from 'next/og';
import { parseShareCode } from '@/lib/shareCode';

export const runtime = 'edge';
export const alt = '이번 주 내 행운 번호 - 로또킹';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BALL_COLORS = (n: number) =>
  n <= 10 ? '#FFC107' : n <= 20 ? '#2196F3' : n <= 30 ? '#FF5722' : n <= 40 ? '#757575' : '#4CAF50';

/**
 * 한글 글꼴: Google Fonts CSS API 의 text= 부분 글꼴(필요한 글자만)을 받아 쓴다.
 * (Vercel OG 예제 방식. 실패하면 한글 없이 숫자만 그린다)
 */
async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@800&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { code: string } }) {
  const ticket = parseShareCode(params.code);
  const numbers = ticket?.numbers ?? [];
  const heading = ticket ? `로또 ${ticket.round}회 · 이번 주 내 행운 번호` : '로또킹 행운 번호';
  const footer = '로또킹 · 나도 무료로 번호 받기';
  // 공 안 숫자도 같은 글꼴로 그리도록 0~9 를 함께 받는다
  const font = await loadKoreanFont(`${heading}${footer}0123456789`);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: font ? 'NotoSansKR' : 'sans-serif',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'linear-gradient(90deg, #D36135, #e8854a)' }} />
        <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: 'white', marginBottom: 56 }}>
          {font ? heading : ticket ? `LOTTO #${ticket.round}` : 'LOTTO KING'}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {numbers.map(n => (
            <div
              key={n}
              style={{
                width: 128,
                height: 128,
                borderRadius: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 56,
                fontWeight: 800,
                color: n <= 10 ? '#333' : 'white',
                background: BALL_COLORS(n),
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              }}
            >
              {n}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#e8854a', marginTop: 56 }}>
          {font ? footer : 'lotto.gon.ai.kr'}
        </div>
      </div>
    ),
    {
      ...size,
      ...(font ? { fonts: [{ name: 'NotoSansKR', data: font, weight: 800 as const, style: 'normal' as const }] } : {}),
    },
  );
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '로또킹 - AI 로또번호 추천 서비스';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  const balls = [
    { n: 3, color: '#FFC107' },
    { n: 12, color: '#2196F3' },
    { n: 24, color: '#FF5722' },
    { n: 33, color: '#757575' },
    { n: 39, color: '#757575' },
    { n: 42, color: '#4CAF50' },
  ];

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
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #D36135, #e8854a)',
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: 'white',
            marginBottom: 8,
            display: 'flex',
          }}
        >
          로또킹
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#D36135',
            marginBottom: 48,
            display: 'flex',
          }}
        >
          AI 로또번호 추천 서비스
        </div>

        {/* Lotto balls */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            marginBottom: 48,
          }}
        >
          {balls.map((ball) => (
            <div
              key={ball.n}
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: ball.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
                boxShadow: `0 4px 12px ${ball.color}66`,
              }}
            >
              {ball.n}
            </div>
          ))}
          <div style={{ fontSize: 30, color: '#666', margin: '0 4px', display: 'flex' }}>+</div>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: '#D36135',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
              color: 'white',
              boxShadow: '0 4px 12px #D3613566',
            }}
          >
            7
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: '#aaa',
            marginBottom: 24,
            display: 'flex',
          }}
        >
          역대 전체 회차 데이터 AI 분석 · 매주 자동 업데이트
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 20,
            color: '#D36135',
            fontWeight: 500,
            display: 'flex',
          }}
        >
          lotto.gon.ai.kr
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #D36135, #e8854a)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}

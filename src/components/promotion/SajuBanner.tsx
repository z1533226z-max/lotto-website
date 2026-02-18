'use client';

import React from 'react';

export default function SajuBanner() {
  return (
    <a
      href="https://saju-website-vercel.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        borderRadius: '16px',
        overflow: 'hidden',
        textDecoration: 'none',
        background: 'linear-gradient(145deg, #0C0B10 0%, #1A1924 50%, #13121A 100%)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        padding: '20px',
        position: 'relative',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
      className="saju-banner-link"
    >
      {/* Gold accent top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #D4AF37, #F0D78C, #D4AF37)',
          borderRadius: '0 0 4px 4px',
        }}
      />

      {/* Compass icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3" stroke="#D4AF37" strokeWidth="1.5" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14.5 9.5L12 12l-2.5 2.5" stroke="#F0D78C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#D4AF37',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            사주명리
          </span>
        </div>
      </div>

      {/* Title */}
      <h4
        style={{
          fontSize: '15px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #F0D78C, #D4AF37, #C9A84C)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 6px 0',
          lineHeight: 1.3,
        }}
      >
        내 사주로 운명 보기
      </h4>

      {/* Description */}
      <p
        style={{
          fontSize: '12px',
          color: '#9B918A',
          margin: '0 0 14px 0',
          lineHeight: 1.5,
        }}
      >
        생년월일시로 보는 사주팔자 풀이,
        <br />
        오행 분석부터 궁합까지 무료
      </p>

      {/* CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#D4AF37' }}>
          사주명리 바로가기
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>

      {/* Glow + shine animation */}
      <style>{`
        @keyframes saju-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.15), 0 0 30px rgba(212, 175, 55, 0.08), 0 4px 20px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.3), 0 0 50px rgba(212, 175, 55, 0.12), 0 4px 20px rgba(0,0,0,0.3); }
        }
        @keyframes saju-shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        .saju-banner-link {
          animation: saju-glow 3s ease-in-out infinite;
        }
        .saju-banner-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 35px rgba(212, 175, 55, 0.35), 0 0 60px rgba(212, 175, 55, 0.15), 0 8px 32px rgba(0,0,0,0.4) !important;
          border-color: rgba(212, 175, 55, 0.5) !important;
        }
        .saju-banner-link::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.15), transparent);
          animation: saju-shine 4s ease-in-out infinite;
          pointer-events: none;
          border-radius: 16px;
        }
      `}</style>
    </a>
  );
}

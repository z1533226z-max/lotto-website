import React from 'react';

function getColor(n: number) {
  if (n <= 10) return 'var(--lotto-yellow, #FDB813)';
  if (n <= 20) return 'var(--lotto-blue, #69C8F2)';
  if (n <= 30) return 'var(--lotto-red, #FF7272)';
  if (n <= 40) return 'var(--lotto-gray, #AAAAAA)';
  return 'var(--lotto-green, #B0D840)';
}

export default function LottoBall({ number, size = 'md' }: { number: number; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? '32px' : '42px';
  const fontSize = size === 'sm' ? '13px' : '16px';

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: dim, height: dim, borderRadius: '50%',
        background: getColor(number), color: '#fff', fontWeight: 700,
        fontSize, textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {number}
    </span>
  );
}

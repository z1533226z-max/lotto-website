import React, { Fragment } from 'react';
import type { TextPart } from '@/lib/roundContent';

/** lib/roundContent 의 글 조각을 화면에 그대로 출력 ({ strong } 은 굵게) */
const TextParts: React.FC<{ parts: TextPart[] }> = ({ parts }) => (
  <>
    {parts.map((p, i) => (typeof p === 'string' ? <Fragment key={i}>{p}</Fragment> : <strong key={i}>{p.strong}</strong>))}
  </>
);

export default TextParts;

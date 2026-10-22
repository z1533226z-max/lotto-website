'use client';

import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useMyNumbers } from '@/hooks/useMyNumbers';

/** 공유받은 번호를 내 번호로 저장 (브라우저에만) */
const SaveSharedNumbers: React.FC<{ round: number; numbers: number[] }> = ({ round, numbers }) => {
  const { add } = useMyNumbers();
  const [saved, setSaved] = useState(false);

  return saved ? (
    <p className="text-sm font-medium text-green-600" role="status">
      저장했습니다. <a href="/lotto/my-numbers" className="underline">내 번호에서 당첨 확인 →</a>
    </p>
  ) : (
    <button
      type="button"
      onClick={() => setSaved(add([numbers], { isAI: false, round }))}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
      style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
    >
      <Bookmark className="w-4 h-4" /> 이 번호 저장하고 당첨 자동 확인
    </button>
  );
};

export default SaveSharedNumbers;

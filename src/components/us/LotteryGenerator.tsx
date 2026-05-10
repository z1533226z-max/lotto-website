'use client';

import { useState } from 'react';

interface Props {
  game: 'powerball' | 'mega-millions';
  mainCount: number;
  mainMax: number;
  bonusMax: number;
  bonusLabel: string;
}

interface Line {
  main: number[];
  bonus: number;
}

function secureRandomInt(maxExclusive: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % maxExclusive;
}

function generateLine(mainCount: number, mainMax: number, bonusMax: number): Line {
  const pool: number[] = [];
  for (let n = 1; n <= mainMax; n++) pool.push(n);
  const main: number[] = [];
  for (let i = 0; i < mainCount; i++) {
    const idx = secureRandomInt(pool.length);
    main.push(pool[idx]);
    pool.splice(idx, 1);
  }
  main.sort((a, b) => a - b);
  const bonus = secureRandomInt(bonusMax) + 1;
  return { main, bonus };
}

export default function LotteryGenerator({
  game,
  mainCount,
  mainMax,
  bonusMax,
  bonusLabel,
}: Props) {
  const [count, setCount] = useState(5);
  const [lines, setLines] = useState<Line[]>([]);

  const handleGenerate = () => {
    const next: Line[] = [];
    for (let i = 0; i < count; i++) {
      next.push(generateLine(mainCount, mainMax, bonusMax));
    }
    setLines(next);
  };

  const ballColor = game === 'powerball' ? 'bg-red-600' : 'bg-yellow-500';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <label className="text-sm font-medium">
          Lines:
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="ml-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {[1, 3, 5, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={handleGenerate}
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Generate
        </button>
      </div>

      {lines.length > 0 && (
        <ol className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          {lines.map((line, idx) => (
            <li key={idx} className="flex flex-wrap items-center gap-2">
              <span className="w-6 text-right text-xs text-gray-500">#{idx + 1}</span>
              {line.main.map((n) => (
                <span
                  key={n}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900 shadow ring-1 ring-gray-300 tabular-nums"
                >
                  {n}
                </span>
              ))}
              <span className="mx-1 text-gray-400">+</span>
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${ballColor} text-sm font-bold text-white shadow tabular-nums`}
                aria-label={bonusLabel}
              >
                {line.bonus}
              </span>
            </li>
          ))}
        </ol>
      )}

      {lines.length === 0 && (
        <p className="text-sm text-gray-500">
          Click <strong>Generate</strong> to produce {count} {count === 1 ? 'line' : 'lines'}.
        </p>
      )}
    </div>
  );
}

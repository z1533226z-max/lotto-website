'use client';

import { useCallback, useEffect, useState } from 'react';
import { safeLocalStorage } from '@/lib/utils';
import {
  MY_NUMBERS_STORAGE_KEY,
  addMyNumbers,
  parseMyNumbers,
  type MyNumberEntry,
} from '@/lib/myNumbers';

const CHANGE_EVENT = 'my-numbers-change';

function read(): MyNumberEntry[] {
  return parseMyNumbers(safeLocalStorage.getItem(MY_NUMBERS_STORAGE_KEY));
}

/** 브라우저에만 저장되는 내 번호 목록 (다른 탭·같은 화면의 다른 컴포넌트와 동기화) */
export function useMyNumbers() {
  const [entries, setEntries] = useState<MyNumberEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sync = () => setEntries(read());
    sync();
    setLoaded(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === MY_NUMBERS_STORAGE_KEY) sync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const write = useCallback((next: MyNumberEntry[]) => {
    const ok = safeLocalStorage.setItem(MY_NUMBERS_STORAGE_KEY, JSON.stringify(next));
    setEntries(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return ok;
  }, []);

  const add = useCallback(
    (sets: number[][], options: { isAI: boolean; round: number }) => write(addMyNumbers(read(), sets, options)),
    [write],
  );
  const remove = useCallback((id: string) => write(read().filter(e => e.id !== id)), [write]);
  const clear = useCallback(() => write([]), [write]);

  return { entries, loaded, add, remove, clear };
}

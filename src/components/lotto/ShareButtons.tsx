'use client';

import React, { useEffect, useState } from 'react';
import { Share2, Link2, MessageCircle } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface Props {
  url: string;
  title: string;
  text: string;
  /** 카카오톡 미리보기 이미지 (절대 주소) */
  imageUrl?: string;
  className?: string;
}

// 카카오 JS SDK — 버전·SRI 는 https://developers.kakao.com/docs/latest/ko/javascript/download 기준
const KAKAO_SDK_SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js';
const KAKAO_SDK_INTEGRITY = 'sha384-JpLApTkB8lPskhVMhT+m5Ln8aHlnS0bsIexhaak0jOhAkMYedQoVghPfSpjNi9K1';
// 공개용 JavaScript 키 (빌드 때 값이 들어감). 값이 없으면 카카오 버튼을 숨긴다.
const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '';

interface KakaoSdk {
  isInitialized(): boolean;
  init(key: string): void;
  Share: { sendDefault(settings: Record<string, unknown>): void };
}

let kakaoLoading: Promise<KakaoSdk> | null = null;

function loadKakao(): Promise<KakaoSdk> {
  const w = window as unknown as { Kakao?: KakaoSdk };
  if (w.Kakao) return Promise.resolve(w.Kakao);
  if (!kakaoLoading) {
    kakaoLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = KAKAO_SDK_SRC;
      script.integrity = KAKAO_SDK_INTEGRITY;
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => (w.Kakao ? resolve(w.Kakao) : reject(new Error('Kakao SDK missing')));
      script.onerror = () => {
        kakaoLoading = null;
        reject(new Error('Kakao SDK load failed'));
      };
      document.head.appendChild(script);
    });
  }
  return kakaoLoading;
}

function track(method: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share', { method, content_type: 'lucky_numbers' });
  }
}

/** 공유 버튼 묶음: 휴대폰 기본 공유(Web Share) · 링크 복사 · 카카오톡(키 있을 때만) */
const ShareButtons: React.FC<Props> = ({ url, title, text, imageUrl, className = '' }) => {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleNative = async () => {
    try {
      await navigator.share({ title, text, url });
      track('web_share');
    } catch {
      // 사용자가 공유 창을 닫은 경우 — 아무것도 하지 않음
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    flash(ok ? '링크를 복사했습니다' : '복사하지 못했습니다');
    if (ok) track('copy_link');
  };

  const handleKakao = async () => {
    try {
      const Kakao = await loadKakao();
      if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description: text,
          ...(imageUrl ? { imageUrl } : {}),
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [{ title: '번호 보기', link: { mobileWebUrl: url, webUrl: url } }],
      });
      track('kakaotalk');
    } catch {
      flash('카카오톡 공유를 열지 못했습니다. 링크 복사를 이용해 주세요');
    }
  };

  const btn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80';

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap justify-center gap-2">
        {KAKAO_JS_KEY && (
          <button type="button" onClick={handleKakao} className={btn} style={{ background: '#FEE500', color: '#191919' }}>
            <MessageCircle className="w-4 h-4" /> 카카오톡 공유
          </button>
        )}
        {canNativeShare && (
          <button type="button" onClick={handleNative} className={`${btn} text-white`} style={{ background: '#D36135' }}>
            <Share2 className="w-4 h-4" /> 공유하기
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className={btn}
          style={{ color: 'var(--text)', border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <Link2 className="w-4 h-4" /> 링크 복사
        </button>
      </div>
      {message && <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }} role="status">{message}</p>}
    </div>
  );
};

export default ShareButtons;

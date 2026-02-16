import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// ─── Constants ─────────────────────────────────────────────

const AUTH_COOKIE_NAME = 'lotto-auth-token';
const TOKEN_EXPIRY_DAYS = 30;
const TOKEN_EXPIRY_MS = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// ─── JWT Helpers (HMAC-SHA256, no external library) ────────

interface TokenPayload {
  userId: string;
  nickname: string;
  iat: number;
  exp: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * JWT 토큰 생성
 */
export function signToken(userId: string, nickname: string): string {
  const secret = getJwtSecret();
  const now = Date.now();

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: TokenPayload = {
    userId,
    nickname,
    iat: now,
    exp: now + TOKEN_EXPIRY_MS,
  };

  const headerStr = base64UrlEncode(JSON.stringify(header));
  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac('sha256', secret)
    .update(`${headerStr}.${payloadStr}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${headerStr}.${payloadStr}.${signature}`;
}

/**
 * JWT 토큰 검증
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = getJwtSecret();
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerStr, payloadStr, signature] = parts;

    // 서명 검증
    const expectedSig = createHmac('sha256', secret)
      .update(`${headerStr}.${payloadStr}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (signature !== expectedSig) return null;

    // 페이로드 파싱
    const payload: TokenPayload = JSON.parse(base64UrlDecode(payloadStr));

    // 만료 확인
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

// ─── Cookie Helpers ────────────────────────────────────────

/**
 * 응답에 인증 쿠키 설정
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY_DAYS * 24 * 60 * 60, // seconds
    path: '/',
  });
}

/**
 * 응답에서 인증 쿠키 삭제
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

// ─── Request Authentication ────────────────────────────────

export interface AuthUser {
  userId: string;
  nickname: string;
}

/**
 * 요청에서 인증 정보 추출 및 검증
 * 인증 실패 시 null 반환
 */
export function getAuthFromRequest(request: NextRequest): AuthUser | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    nickname: payload.nickname,
  };
}

/**
 * 클라이언트 IP 주소 가져오기 (rate limiting용)
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

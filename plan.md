# 프로젝트 현재 상태 (2026-03-01)

## 완료된 작업

### gon-services 백엔드 구축 (완료)
- [x] FastAPI 백엔드 서버 (Railway 배포)
- [x] Neon PostgreSQL DB (lotto_results 테이블)
- [x] APScheduler 자동 수집 (토 21/22시, 일 0/9시)
- [x] 프론트엔드 dataFetcher.ts 연동 (4단계 fallback)

### 코드 품질 정밀 리뷰 (2026-03 완료)
- [x] 28건 이슈 발견 → 25건 수정
- [x] Supabase `as any` 67건 완전 제거 (24개 파일)
- [x] database.ts 타입 전면 개편 (interface → type alias)
- [x] global.d.ts 생성 (Window 전역 타입)
- [x] TypeScript 타입체크 0 에러

### 신규 페이지 (2026-03 추가)
- [x] `/lotto/number/[id]` - 번호별(1~45) 출현 분석
- [x] `/lotto/year/[year]` - 연도별 통계 분석
- [x] `/lotto/pattern/[type]` - 8가지 패턴 분석
- [x] `/lotto/dream/[keyword]` - 꿈해몽 개별 상세
- [x] sitemap.ts에 신규 페이지 URL 등록
- [x] Header 네비게이션 업데이트

## 미해결 사항 (저우선)

| 항목 | 설명 | 비고 |
|---|---|---|
| 서버리스 캐시 한계 | Vercel Serverless는 인스턴스 간 메모리 캐시 공유 불가 | Redis/Upstash 도입 시 해결 |
| maxconn 환경변수 | Supabase 커넥션 풀 크기 하드코딩 (10) | 현재 충분, 필요시 env 전환 |
| `as any` 2건 | `performance/route.ts` 테스트 코드 | 의도적 사용 |

## 향후 고려사항

- Redis/Upstash 캐시 레이어 도입 (트래픽 증가 시)
- Supabase Edge Functions 활용 가능성
- 이미지 최적화 (번호 카드 OG 이미지 동적 생성)
- PWA 지원 (오프라인 모드, 푸시 알림)

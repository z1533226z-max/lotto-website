# CLAUDE.md — 로또 웹사이트

## Deploy Configuration (configured by /setup-deploy)
- Platform: Vercel (서울 리전 icn1)
- Production URL: https://lotto.gon.ai.kr
- Deploy workflow: automatic on push to main (Vercel)
- Deploy status command: HTTP health check
- Merge method: squash
- Project type: web app (Next.js)
- Post-deploy health check: https://lotto.gon.ai.kr

### Custom deploy hooks
- Pre-merge: npx tsc --noEmit
- Deploy trigger: automatic on push to main
- Health check: curl -sf https://lotto.gon.ai.kr -o /dev/null -w "%{http_code}"

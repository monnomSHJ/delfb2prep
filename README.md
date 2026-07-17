# DELF B2 학습 툴

DELF B2 준비용 개인 웹앱. 자세한 기획은 `SPEC.md`, 작업 규칙은 `CLAUDE.md` 참고.

## 개발 환경 설정

```bash
cp .env.local.example .env.local
# .env.local에 Supabase project URL / anon key 입력
npm install
npm run dev
```

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Vercel

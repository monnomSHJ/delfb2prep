# CLAUDE.md — DELF B2 학습 툴 프로젝트 규칙

이 파일은 Claude Code가 이 프로젝트에서 지켜야 할 규칙이다. 상세 기획은 `SPEC.md` 참조.

## 프로젝트 한 줄 요약
DELF B2 준비용 개인 웹앱. 쓰기 연습 + 어휘/표현 SRS 복습 + 아이디어 뱅크 + 아카이브. 폰·노트북 동기화. **앱은 유료 AI API를 호출하지 않는다.**

## 기술 스택 (고정)
- Next.js (App Router) + React + TypeScript
- Tailwind CSS, 모바일 우선 반응형, PWA
- Supabase (Postgres + Auth), RLS로 본인 데이터만 접근
- Vercel 배포

## 절대 규칙
1. **AI API 호출 금지.** 앱 안에서 Anthropic/OpenAI 등 어떤 LLM API도 부르지 않는다. 첨삭은 "프롬프트 복사 → 외부 Claude → 결과 붙여넣기(import)" 흐름으로만 처리한다.
2. **비밀키를 프론트에 두지 않는다.** service role key 등 서버 시크릿이 필요한 구조 자체를 만들지 않는다. anon key + RLS로 해결.
3. **브라우저 스토리지 규칙**: 인증·동기화 데이터는 Supabase에 저장(로컬 캐시는 무방). 데이터 원본은 항상 서버.
4. **범위 밖 기능 만들지 않기**: 읽기/듣기 학습, 녹음, 타이머, 앱 내장 첨삭 — 전부 제외(SPEC §1).

## 작업 방식
- SPEC의 Phase 순서대로 진행. **한 번에 전체를 만들지 말 것.** Phase 단위로 끊어서 구현하고, 각 Phase 끝에 배포 가능한 상태로 만든다.
- 새 Phase 시작 전 SPEC의 해당 섹션을 다시 읽고 확인.
- 스키마 변경은 SQL 마이그레이션 파일로 남긴다.
- 커밋은 기능 단위로 작게.

## 데이터 모델
`vocab`, `writings`, `ideas` 세 테이블. 정확한 컬럼은 SPEC §3. `writings.score`/`feedback`은 nullable jsonb (import로 채워짐).

## 첨삭 프롬프트
"복사" 버튼이 만드는 프롬프트 전문과 기대 JSON 스키마는 SPEC §4에 있다. import 파서는 그 스키마를 기준으로 파싱하고, 실패 시 원문을 `feedback.raw`로 저장.

## 디자인
frontend-design 원칙(SPEC §6). AI 클리셰 3종(크림+세리프+테라코타 #D97757 계열 / 검정+형광 / 신문 레이아웃) 회피. 프랑스어 라벨은 악상 포함 정확히.

## 프랑스어 정확성
UI에 노출되는 프랑스어(consigne, cohérence, morphosyntaxe, Banque d'idées 등)는 철자·악상을 정확히. 확신 없으면 확인 후 사용.

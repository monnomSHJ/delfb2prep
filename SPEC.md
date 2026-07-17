# SPEC — DELF B2 개인 학습 툴

> 개인용 웹앱. DELF B2 시험 준비를 위한 쓰기 연습 · 어휘/표현 복습 · 아이디어 뱅크 · 아카이브 도구.
> 폰과 노트북에서 같은 URL로 접근하며, 데이터는 계정 기준으로 기기 간 동기화된다.

---

## 1. 목적과 범위

### 만드는 것
- 쓰기(및 텍스트 기반 말하기) 연습 스튜디오
- 어휘 · 주요 표현 · 문장 구조 복습 노트 (간격반복 SRS)
- 주제별 아이디어 뱅크
- 모든 학습 활동의 통합 아카이브

### 만들지 않는 것 (명시적 제외)
- 읽기 · 듣기 학습 기능 (사용자가 외부에서 별도 학습)
- 오디오 녹음 (말하기도 텍스트로만 작성)
- 타이머
- **앱 내장 AI 첨삭 (API 호출 없음)** — 첨삭은 외부 Claude 앱/Claude Code에서 받고 결과를 import

### 비용 원칙
- 만들기: 무료 (전부 무료 티어)
- 쓰기: 완전 무료 (앱에서 유료 API를 호출하지 않음)
- 첨삭은 사용자의 기존 Claude 구독 안에서 처리 → 앱은 프롬프트 복사와 결과 import만 담당

---

## 2. 핵심 기능

### 2.1 라이팅 스튜디오 (Writing Studio)
쓰기와 말하기 공용 엔진. `mode` 태그로만 구분(écrit / oral).

작성 흐름:
1. **문제 입력** — 사용자가 교재에서 뽑은 문제 텍스트를 직접 붙여넣음
2. **개요 작성** — 별도 입력 칸 (논거 구조 잡기)
3. **작문** — 본문 입력 칸 + **단어 수 카운터**(실시간)
4. **저장** — 작성물이 히스토리에 저장됨
5. **첨삭용 프롬프트 복사** — 버튼 클릭 시 채점 프롬프트 + 작성 내용이 클립보드에 담김 (§4 템플릿)
6. **첨삭 결과 import** — 외부 Claude에서 받은 결과(JSON)를 붙여넣으면 파싱되어 점수·피드백·제안이 해당 작문에 저장됨. 파싱 실패 시 원문 텍스트로 폴백 저장.

필요 요소: 단어 수 카운터, 저장, 히스토리(목록·검색·필터). 타이머 없음, 녹음 없음.

### 2.2 복습 노트 (Vocab & Expressions) — SRS
- 항목 유형: `word`(어휘) / `expression`(표현) / `structure`(문장 구조)
- 필드: 용어, 의미, 예문, 태그
- **간격반복(SRS)**: 오늘 복습할 카드를 보여주는 방식. 응답 난이도에 따라 다음 복습일 계산 (SM-2 계열 알고리즘 권장)
- "오늘의 복습" 뷰 + 전체 목록(검색·태그 필터) 뷰

### 2.3 아이디어 뱅크 (Banque d'idées)
- 주제별 논거·예시·통계·표현 축적 (AI, 사회, 경제, 환경, 기술, 미디어 등)
- 필드: 주제(topic), 내용(content), 출처(source), 태그
- 주제별 그룹핑 뷰 + 검색

### 2.4 아카이브 / 대시보드
- 별도 기능이라기보다 원칙: 모든 활동이 저장되고 되짚어볼 수 있음
- 대시보드: 최근 작문, 점수 추이(첨삭 import된 것 기준), 오늘 복습할 카드 수, 주제별 아이디어 수

### 2.5 기능 간 연결 (선순환)
- 첨삭 결과에서 발견한 새 표현 → **복습 노트로 보내기** 버튼
- 작문 중 떠오른 논거 → **아이디어 뱅크로 보내기**
- 아이디어 뱅크의 주제 → **라이팅 문제로 불러오기**

---

## 3. 데이터 모델

Supabase(Postgres). 모든 테이블에 `user_id`(auth.users FK)와 RLS(본인 행만 접근) 적용.

```
vocab
  id, user_id, type ('word'|'expression'|'structure'),
  term, meaning, example, tags (text[]),
  srs_due (date), srs_interval (int), ease (float), reps (int),
  created_at

writings
  id, user_id, mode ('écrit'|'oral'), prompt,
  outline, body, word_count,
  score (jsonb, nullable),       -- 항목별 + 총점
  feedback (jsonb, nullable),    -- 구체적 피드백 + 제안
  created_at

ideas
  id, user_id, topic, content, source, tags (text[]), created_at
```

`score` / `feedback`는 nullable. 작성 시엔 비어 있고, import 시 채워진다. 스키마 변경 없이 첨삭 결과가 얹힌다.

---

## 4. 첨삭 프롬프트 템플릿 (앱이 "복사" 버튼으로 생성)

DELF B2 작문 채점표(grille) 4항목 기준. 복사 시 아래 텍스트에 실제 문제/개요/본문이 채워진다.

```
당신은 DELF B2 작문 채점관입니다. 아래 작문을 DELF B2 공식 채점표(grille d'évaluation)의
4개 항목 기준으로 채점하고 첨삭해 주세요. 결과는 반드시 아래 JSON 형식으로만 출력하세요
(설명·머리말·코드펜스 없이 JSON 객체 하나만).

채점 항목 (production écrite):
1. respect_consigne  — 과제 수행: 지시사항 준수, 요구된 글 유형·분량·목적 충족
2. coherence_cohesion — 논증 전개: 논지의 일관성, 문단 구성, 연결어(connecteurs) 사용
3. lexique            — 어휘: B2 수준 어휘의 폭과 정확성
4. morphosyntaxe      — 문법: 시제·태·구문의 정확성과 다양성

출력 형식:
{
  "score": {
    "respect_consigne": { "points": 0, "max": 5, "comment": "" },
    "coherence_cohesion": { "points": 0, "max": 5, "comment": "" },
    "lexique": { "points": 0, "max": 6.5, "comment": "" },
    "morphosyntaxe": { "points": 0, "max": 8.5, "comment": "" },
    "total": { "points": 0, "max": 25 }
  },
  "feedback": {
    "corrections": [
      { "original": "원문 표현", "suggestion": "수정 제안", "reason": "이유(문법/어휘/논리)" }
    ],
    "strengths": ["잘한 점"],
    "improvements": ["개선 방향"],
    "better_expressions": [
      { "instead_of": "밋밋한 표현", "use": "더 B2다운 표현/연결어" }
    ]
  }
}

--- 작문 ---
[mode]: {écrit 또는 oral}
[문제]: {prompt}
[개요]: {outline}
[본문]: {body}
```

> 배점(5/5/6.5/8.5=25)은 DELF 공식 배점을 근사한 것. 실제 시행 회차 기준이 다르면 SPEC에서 숫자만 조정한다.
> import 파서는 이 JSON 스키마(`score`, `feedback`)를 기대한다. 파싱 실패 시 붙여넣은 원문을 `feedback.raw`로 저장하는 폴백을 둔다.

---

## 5. 아키텍처

- **프론트**: Next.js (App Router) + React + TypeScript
- **스타일**: Tailwind CSS. 반응형(모바일 우선). PWA(홈 화면 추가 지원)
- **백엔드/DB/인증**: Supabase (Postgres + Auth). 무료 티어
- **배포**: Vercel (GitHub 연동, 무료 Hobby)
- **API 프록시·Edge Function·서버 시크릿 없음** — 앱은 외부 AI를 호출하지 않는다

접근: 배포된 단일 URL을 폰·노트북 브라우저에서 로그인해 사용 → 데이터 동기화.

---

## 6. 디자인 방향 (frontend-design 원칙 요약)

- 템플릿처럼 보이지 않게, 이 앱만의 시각 정체성을 가질 것
- 회피할 기본값: 크림색 배경 + 세리프 + 테라코타 액센트 조합(#D97757 계열), 검정 배경 + 형광 액센트, 신문식 레이아웃 — 브리프가 명시하지 않는 한 이 세 가지 클리셰는 피한다
- 타이포그래피로 개성을 낸다: 디스플레이/본문 서체를 의도적으로 페어링, 명확한 타입 스케일
- 프랑스어 학습이라는 주제 세계에서 구체적 디자인 단서를 끌어온다
- 접근성 기본선: 모바일 대응, 키보드 포커스 가시화, prefers-reduced-motion 존중
- 카피는 사용자 입장에서, 능동태로, 문장부호는 sentence case. 빈 화면은 행동을 유도하는 안내로.
- **프랑스어 UI 라벨 정확성**: 앱에 프랑스어 용어가 노출되므로(mode, consigne 등) 철자·악상 정확히

---

## 7. 개발 순서 (Phase)

각 Phase는 배포 가능한 상태로 끝난다. 완료 시마다 Vercel 배포 후 폰에서 확인.

- **Phase 0 — 뼈대**: Next.js + Supabase + Tailwind 세팅, 인증, 대시보드 껍데기, 폰↔PC 동기화 확인
- **Phase 1 — 라이팅 스튜디오**: 문제 입력 → 개요 → 작문(단어수) → 저장/히스토리 + 프롬프트 복사 버튼 + 결과 import(JSON 파싱)
- **Phase 2 — 복습 노트 + SRS**: 카드 CRUD, 오늘의 복습 뷰, 간격반복 알고리즘
- **Phase 3 — 아이디어 뱅크 + 기능 간 '보내기' 연결**
- **Phase 4 — 대시보드 마감 + PWA + 디자인 다듬기**

---

## 8. 준비물 (사용자가 직접 발급 — 코드로 대체 불가)

- Supabase 프로젝트 1개 → project URL, anon key
- Vercel 계정 (GitHub 연동)
- Anthropic API 키: **불필요** (앱이 API를 호출하지 않으므로)

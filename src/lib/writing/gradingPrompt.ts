import type { WritingMode } from "./types";

type PromptInput = {
  mode: WritingMode;
  prompt: string;
  outline: string;
  body: string;
};

export function buildGradingPrompt({ mode, prompt, outline, body }: PromptInput): string {
  return `당신은 DELF B2 작문 채점관입니다. 아래 작문을 DELF B2 공식 채점표(grille d'évaluation)의
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
[mode]: ${mode}
[문제]: ${prompt}
[개요]: ${outline}
[본문]: ${body}`;
}

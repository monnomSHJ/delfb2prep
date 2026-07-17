import type { GradingFeedback, GradingScore, RawFeedback } from "./types";

export type ParsedGradingResult = {
  score: GradingScore | null;
  feedback: GradingFeedback | RawFeedback;
  ok: boolean;
};

function stripCodeFence(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : text.trim();
}

function isCriterion(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.points === "number" && typeof v.max === "number";
}

function isValidScore(value: unknown): value is GradingScore {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isCriterion(v.respect_consigne) &&
    isCriterion(v.coherence_cohesion) &&
    isCriterion(v.lexique) &&
    isCriterion(v.morphosyntaxe) &&
    isCriterion(v.total)
  );
}

function isValidFeedback(value: unknown): value is GradingFeedback {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.corrections) &&
    Array.isArray(v.strengths) &&
    Array.isArray(v.improvements) &&
    Array.isArray(v.better_expressions)
  );
}

export function parseGradingResult(raw: string): ParsedGradingResult {
  try {
    const parsed = JSON.parse(stripCodeFence(raw));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      isValidScore((parsed as Record<string, unknown>).score) &&
      isValidFeedback((parsed as Record<string, unknown>).feedback)
    ) {
      return {
        score: (parsed as { score: GradingScore }).score,
        feedback: (parsed as { feedback: GradingFeedback }).feedback,
        ok: true,
      };
    }
  } catch {
    // 아래 폴백으로 진행
  }

  return {
    score: null,
    feedback: { raw },
    ok: false,
  };
}

export type WritingMode = "écrit" | "oral";

export type GradingCriterion = {
  points: number;
  max: number;
  comment: string;
};

export type GradingScore = {
  respect_consigne: GradingCriterion;
  coherence_cohesion: GradingCriterion;
  lexique: GradingCriterion;
  morphosyntaxe: GradingCriterion;
  total: { points: number; max: number };
};

export type GradingCorrection = {
  original: string;
  suggestion: string;
  reason: string;
};

export type GradingBetterExpression = {
  instead_of: string;
  use: string;
};

export type GradingFeedback = {
  corrections: GradingCorrection[];
  strengths: string[];
  improvements: string[];
  better_expressions: GradingBetterExpression[];
};

export type RawFeedback = {
  raw: string;
};

export type Writing = {
  id: string;
  user_id: string;
  mode: WritingMode;
  prompt: string;
  outline: string;
  body: string;
  word_count: number;
  score: GradingScore | null;
  feedback: GradingFeedback | RawFeedback | null;
  created_at: string;
};

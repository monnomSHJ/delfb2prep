export type VocabType = "word" | "expression" | "structure";

export type VocabCard = {
  id: string;
  user_id: string;
  type: VocabType;
  term: string;
  meaning: string;
  example: string;
  tags: string[];
  srs_due: string;
  srs_interval: number;
  ease: number;
  reps: number;
  created_at: string;
};

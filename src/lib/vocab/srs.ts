export type ReviewGrade = "again" | "hard" | "good" | "easy";

const GRADE_QUALITY: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export const GRADE_LABELS: Record<ReviewGrade, string> = {
  again: "다시",
  hard: "어려움",
  good: "보통",
  easy: "쉬움",
};

type SrsState = {
  srs_interval: number;
  ease: number;
  reps: number;
};

type SrsResult = SrsState & { srs_due: string };

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// SM-2 계열: quality < 3이면 리셋, 아니면 반복 횟수에 따라 간격을 늘리고 ease를 조정한다.
export function computeNextReview(
  grade: ReviewGrade,
  current: SrsState,
  today: Date,
): SrsResult {
  const quality = GRADE_QUALITY[grade];
  let { reps } = current;
  let interval: number;

  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 6;
    } else {
      interval = Math.round(current.srs_interval * current.ease);
    }
    reps += 1;
  }

  const ease = Math.max(
    1.3,
    current.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  const due = new Date(today);
  due.setDate(due.getDate() + interval);

  return { srs_interval: interval, ease, reps, srs_due: toISODate(due) };
}

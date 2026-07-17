"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { gradeReview } from "../vocab/actions";
import { GRADE_LABELS, type ReviewGrade } from "@/lib/vocab/srs";
import type { VocabCard } from "@/lib/vocab/types";

const TYPE_LABELS: Record<VocabCard["type"], string> = {
  word: "어휘",
  expression: "표현",
  structure: "문장 구조",
};

const GRADES: ReviewGrade[] = ["again", "hard", "good", "easy"];

export function ReviewSession({ initialCards }: { initialCards: VocabCard[] }) {
  const [queue, setQueue] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const current = queue[0];

  function handleGrade(grade: ReviewGrade) {
    if (!current) return;
    startTransition(async () => {
      await gradeReview(current.id, grade);
      setQueue((q) => q.slice(1));
      setReviewedCount((n) => n + 1);
      setRevealed(false);
    });
  }

  if (!current) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-ink-50 px-6 py-10 text-center">
        <p className="text-lg font-medium text-ink-900">
          {reviewedCount > 0
            ? `오늘의 복습을 끝냈습니다! (${reviewedCount}개)`
            : "오늘 복습할 카드가 없습니다."}
        </p>
        <Link
          href="/vocab"
          className="mt-4 inline-block text-sm font-medium text-plum-600 hover:underline"
        >
          전체 카드 목록 보기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink-500">남은 카드: {queue.length}개</p>

      <div className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-ink-50 p-6">
        <span className="self-start rounded-full bg-plum-50 px-2.5 py-0.5 text-xs font-medium text-plum-700">
          {TYPE_LABELS[current.type]}
        </span>
        <p className="font-display text-2xl font-semibold text-ink-900">
          {current.term}
        </p>

        {revealed ? (
          <div className="flex flex-col gap-2 border-t border-ink-200 pt-4">
            <p className="text-base text-ink-900">{current.meaning}</p>
            {current.example && (
              <p className="text-sm italic text-ink-500">{current.example}</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="self-start rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
          >
            정답 보기
          </button>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GRADES.map((grade) => (
            <button
              key={grade}
              type="button"
              disabled={isPending}
              onClick={() => handleGrade(grade)}
              className="rounded-xl border border-ink-200 px-4 py-3 text-sm font-medium text-ink-700 transition hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600 disabled:opacity-60"
            >
              {GRADE_LABELS[grade]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

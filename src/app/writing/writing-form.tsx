"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createWriting, updateDraft } from "./actions";
import { countWords } from "@/lib/writing/wordCount";
import type { WritingMode } from "@/lib/writing/types";

type WritingFormProps =
  | { variant: "create"; initial?: { prompt?: string } }
  | {
      variant: "edit";
      id: string;
      initial: { mode: WritingMode; prompt: string; outline: string; body: string };
    };

const MODES: { value: WritingMode; label: string }[] = [
  { value: "écrit", label: "Écrit · 쓰기" },
  { value: "oral", label: "Oral · 말하기(텍스트)" },
];

export function WritingForm(props: WritingFormProps) {
  const editInitial = props.variant === "edit" ? props.initial : undefined;
  const createInitial = props.variant === "create" ? props.initial : undefined;
  const [mode, setMode] = useState<WritingMode>(editInitial?.mode ?? "écrit");
  const [prompt, setPrompt] = useState(
    editInitial?.prompt ?? createInitial?.prompt ?? "",
  );
  const [outline, setOutline] = useState(editInitial?.outline ?? "");
  const [body, setBody] = useState(editInitial?.body ?? "");
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const wordCount = countWords(body);

  function handleSave() {
    const data = { mode, prompt, outline, body };
    startTransition(async () => {
      if (props.variant === "create") {
        await createWriting(data);
      } else {
        await updateDraft(props.id, data);
        setSavedAt(Date.now());
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex gap-2">
        <legend className="sr-only">글 종류</legend>
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600 ${
              mode === m.value
                ? "bg-plum-600 text-white"
                : "border border-ink-200 text-ink-700 hover:bg-ink-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">문제 (consigne)</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="교재에서 뽑은 문제 텍스트를 붙여넣으세요"
          rows={3}
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-700">개요</span>
          {outline.trim() && (
            <Link
              href={`/ideas/new?content=${encodeURIComponent(outline)}`}
              className="text-xs font-medium text-plum-600 hover:underline"
            >
              아이디어 뱅크로 보내기 →
            </Link>
          )}
        </div>
        <textarea
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
          placeholder="논거 구조를 먼저 잡아보세요"
          rows={4}
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-700">작문</span>
          <span className="text-sm tabular-nums text-ink-500">{wordCount}단어</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="본문을 작성하세요"
          rows={14}
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base leading-relaxed text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl bg-plum-600 px-5 py-3 text-base font-medium text-white transition hover:bg-plum-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600 disabled:opacity-60"
        >
          {isPending ? "저장 중…" : "저장"}
        </button>
        {savedAt && !isPending && (
          <span className="text-sm text-moss-500">저장되었습니다</span>
        )}
      </div>
    </div>
  );
}

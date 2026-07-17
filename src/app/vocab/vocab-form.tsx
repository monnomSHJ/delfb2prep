"use client";

import { useState, useTransition } from "react";
import { createCard, deleteCard, updateCard } from "./actions";
import type { VocabType } from "@/lib/vocab/types";

type VocabFormProps =
  | { variant: "create" }
  | {
      variant: "edit";
      id: string;
      initial: {
        type: VocabType;
        term: string;
        meaning: string;
        example: string;
        tags: string[];
      };
    };

const TYPES: { value: VocabType; label: string }[] = [
  { value: "word", label: "어휘" },
  { value: "expression", label: "표현" },
  { value: "structure", label: "문장 구조" },
];

export function VocabForm(props: VocabFormProps) {
  const initial = props.variant === "edit" ? props.initial : undefined;
  const [type, setType] = useState<VocabType>(initial?.type ?? "word");
  const [term, setTerm] = useState(initial?.term ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function parsedTags(): string[] {
    return tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function handleSave() {
    const data = { type, term, meaning, example, tags: parsedTags() };
    startTransition(async () => {
      if (props.variant === "create") {
        await createCard(data);
      } else {
        await updateCard(props.id, data);
        setSavedAt(Date.now());
      }
    });
  }

  function handleDelete() {
    if (props.variant !== "edit") return;
    if (!confirm("이 카드를 삭제할까요?")) return;
    startTransition(async () => {
      await deleteCard(props.id);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex gap-2">
        <legend className="sr-only">항목 유형</legend>
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600 ${
              type === t.value
                ? "bg-plum-600 text-white"
                : "border border-ink-200 text-ink-700 hover:bg-ink-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">용어</span>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="예: néanmoins"
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">의미</span>
        <textarea
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          rows={2}
          placeholder="뜻 또는 한국어 설명"
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">예문</span>
        <textarea
          value={example}
          onChange={(e) => setExample(e.target.value)}
          rows={2}
          placeholder="이 표현이 쓰인 예문"
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">태그 (쉼표로 구분)</span>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="예: connecteurs, B2"
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
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
        {props.variant === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="ml-auto rounded-xl border border-ink-200 px-4 py-3 text-sm font-medium text-ink-500 transition hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600 disabled:opacity-60"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}

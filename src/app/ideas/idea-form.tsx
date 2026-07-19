"use client";

import { useState, useTransition } from "react";
import { createIdea, deleteIdea, updateIdea } from "./actions";

type IdeaFormProps =
  | {
      variant: "create";
      initial?: {
        topic?: string;
        content?: string;
        source?: string;
        tags?: string[];
      };
    }
  | {
      variant: "edit";
      id: string;
      initial: {
        topic: string;
        content: string;
        source: string;
        tags: string[];
      };
    };

export function IdeaForm(props: IdeaFormProps) {
  const initial = props.initial;
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [source, setSource] = useState(initial?.source ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags?.join(", ") ?? "");
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function parsedTags(): string[] {
    return tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function handleSave() {
    const data = { topic, content, source, tags: parsedTags() };
    startTransition(async () => {
      if (props.variant === "create") {
        await createIdea(data);
      } else {
        await updateIdea(props.id, data);
        setSavedAt(Date.now());
      }
    });
  }

  function handleDelete() {
    if (props.variant !== "edit") return;
    if (!confirm("이 아이디어를 삭제할까요?")) return;
    startTransition(async () => {
      await deleteIdea(props.id);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">주제</span>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: environnement, technologie"
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">내용</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="논거·예시·통계·표현을 자유롭게 적어두세요"
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base leading-relaxed text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">출처</span>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="예: Le Monde, 2026년 5월 기사"
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">태그 (쉼표로 구분)</span>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="예: environnement, B2"
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

"use client";

import { useState, useTransition } from "react";
import { importFeedback } from "../actions";
import { buildGradingPrompt } from "@/lib/writing/gradingPrompt";
import type {
  GradingFeedback,
  GradingScore,
  RawFeedback,
  WritingMode,
} from "@/lib/writing/types";

type GradingPanelProps = {
  writingId: string;
  mode: WritingMode;
  prompt: string;
  outline: string;
  body: string;
  score: GradingScore | null;
  feedback: GradingFeedback | RawFeedback | null;
};

function isRawFeedback(
  feedback: GradingFeedback | RawFeedback,
): feedback is RawFeedback {
  return "raw" in feedback;
}

export function GradingPanel({
  writingId,
  mode,
  prompt,
  outline,
  body,
  score,
  feedback,
}: GradingPanelProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<
    "idle" | "parsed" | "fallback"
  >("idle");
  const [isPending, startTransition] = useTransition();

  async function handleCopy() {
    const text = buildGradingPrompt({ mode, prompt, outline, body });
    await navigator.clipboard.writeText(text);
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus("idle"), 2000);
  }

  function handleImport() {
    if (!importText.trim()) return;
    startTransition(async () => {
      const ok = await importFeedback(writingId, importText);
      setImportStatus(ok ? "parsed" : "fallback");
      setImportText("");
    });
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-ink-200 bg-ink-50 p-5">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold text-ink-900">
          첨삭받기
        </h2>
        <p className="text-sm text-ink-500">
          아래 버튼으로 채점 프롬프트를 복사해 외부 Claude에 붙여넣고, 받은 JSON
          결과를 다시 여기에 붙여넣어 가져오세요.
        </p>
        <div>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-plum-500 px-4 py-2.5 text-sm font-medium text-plum-600 transition hover:bg-plum-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
          >
            {copyStatus === "copied" ? "복사됨!" : "첨삭용 프롬프트 복사"}
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-700">
          첨삭 결과 붙여넣기 (JSON)
        </span>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='{"score": {...}, "feedback": {...}}'
          rows={5}
          className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={isPending || !importText.trim()}
            className="self-start rounded-xl bg-plum-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-plum-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600 disabled:opacity-60"
          >
            {isPending ? "가져오는 중…" : "결과 가져오기"}
          </button>
          {importStatus === "parsed" && (
            <span className="text-sm text-moss-500">채점 결과를 반영했습니다</span>
          )}
          {importStatus === "fallback" && (
            <span className="text-sm text-ink-500">
              형식을 인식하지 못해 원문을 그대로 저장했습니다
            </span>
          )}
        </div>
      </label>

      {(score || feedback) && (
        <div className="flex flex-col gap-4 border-t border-ink-200 pt-4">
          {score && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { key: "respect_consigne", label: "과제 수행" },
                { key: "coherence_cohesion", label: "논증 전개" },
                { key: "lexique", label: "어휘" },
                { key: "morphosyntaxe", label: "문법" },
              ].map(({ key, label }) => {
                const c = score[key as keyof Omit<GradingScore, "total">];
                return (
                  <div key={key} className="rounded-xl bg-white p-3">
                    <p className="text-xs text-ink-500">{label}</p>
                    <p className="font-display text-lg font-semibold text-ink-900">
                      {c.points}/{c.max}
                    </p>
                  </div>
                );
              })}
              <div className="col-span-2 rounded-xl bg-plum-50 p-3 sm:col-span-4">
                <p className="text-xs text-plum-700">총점</p>
                <p className="font-display text-lg font-semibold text-plum-700">
                  {score.total.points}/{score.total.max}
                </p>
              </div>
            </div>
          )}

          {feedback && isRawFeedback(feedback) && (
            <pre className="whitespace-pre-wrap rounded-xl bg-white p-3 text-sm text-ink-700">
              {feedback.raw}
            </pre>
          )}

          {feedback && !isRawFeedback(feedback) && (
            <div className="flex flex-col gap-4 text-sm text-ink-700">
              {feedback.corrections.length > 0 && (
                <div>
                  <p className="font-medium text-ink-900">수정 제안</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {feedback.corrections.map((c, i) => (
                      <li key={i} className="rounded-lg bg-white p-3">
                        <span className="line-through text-ink-500">
                          {c.original}
                        </span>{" "}
                        → <span className="text-plum-700">{c.suggestion}</span>
                        <p className="mt-1 text-xs text-ink-500">{c.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {feedback.strengths.length > 0 && (
                <div>
                  <p className="font-medium text-ink-900">잘한 점</p>
                  <ul className="mt-1 list-disc pl-5">
                    {feedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {feedback.improvements.length > 0 && (
                <div>
                  <p className="font-medium text-ink-900">개선 방향</p>
                  <ul className="mt-1 list-disc pl-5">
                    {feedback.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {feedback.better_expressions.length > 0 && (
                <div>
                  <p className="font-medium text-ink-900">더 B2다운 표현</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {feedback.better_expressions.map((e, i) => (
                      <li key={i} className="rounded-lg bg-white p-3">
                        <span className="text-ink-500">{e.instead_of}</span> →{" "}
                        <span className="text-plum-700">{e.use}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

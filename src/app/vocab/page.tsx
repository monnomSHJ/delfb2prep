import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { VocabCard, VocabType } from "@/lib/vocab/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "복습 노트",
};

const TYPE_LABELS: Record<VocabType, string> = {
  word: "어휘",
  expression: "표현",
  structure: "문장 구조",
};

export default async function VocabListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; tag?: string }>;
}) {
  const { q, type, tag } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("vocab")
    .select("*")
    .order("created_at", { ascending: false });

  if (type === "word" || type === "expression" || type === "structure") {
    query = query.eq("type", type);
  }
  if (q) {
    query = query.or(`term.ilike.%${q}%,meaning.ilike.%${q}%`);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data: cards } = await query.returns<VocabCard[]>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-plum-600 hover:underline"
          >
            ← 대시보드
          </Link>
          <p className="font-display mt-2 text-sm font-medium uppercase tracking-[0.2em] text-plum-500">
            복습 노트
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
            전체 목록
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/review"
            className="rounded-xl border border-plum-500 px-4 py-2.5 text-sm font-medium text-plum-600 transition hover:bg-plum-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
          >
            오늘의 복습
          </Link>
          <Link
            href="/vocab/new"
            className="rounded-xl bg-plum-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-plum-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
          >
            새 카드
          </Link>
        </div>
      </header>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="용어·의미 검색"
          className="flex-1 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
        <input
          type="text"
          name="tag"
          defaultValue={tag ?? ""}
          placeholder="태그"
          className="w-32 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        >
          <option value="">모든 유형</option>
          <option value="word">어휘</option>
          <option value="expression">표현</option>
          <option value="structure">문장 구조</option>
        </select>
        <button
          type="submit"
          className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
        >
          검색
        </button>
      </form>

      {!cards || cards.length === 0 ? (
        <p className="rounded-2xl border border-ink-200 bg-ink-50 px-6 py-8 text-center text-sm text-ink-500">
          {q || type || tag
            ? "조건에 맞는 카드가 없습니다."
            : "아직 등록한 카드가 없습니다. 새 카드를 추가해보세요."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {cards.map((c) => (
            <li key={c.id}>
              <Link
                href={`/vocab/${c.id}`}
                className="flex flex-col gap-1 rounded-2xl border border-ink-200 bg-ink-50 p-4 transition hover:border-plum-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-plum-50 px-2.5 py-0.5 text-xs font-medium text-plum-700">
                    {TYPE_LABELS[c.type]}
                  </span>
                  <span className="text-xs text-ink-500">
                    다음 복습: {c.srs_due}
                  </span>
                </div>
                <p className="text-base font-medium text-ink-900">{c.term}</p>
                <p className="line-clamp-1 text-sm text-ink-500">{c.meaning}</p>
                {c.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Writing } from "@/lib/writing/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "라이팅 히스토리",
};

export default async function WritingHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>;
}) {
  const { q, mode } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("writings")
    .select("*")
    .order("created_at", { ascending: false });

  if (mode === "écrit" || mode === "oral") {
    query = query.eq("mode", mode);
  }
  if (q) {
    query = query.ilike("prompt", `%${q}%`);
  }

  const { data: writings } = await query.returns<Writing[]>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-plum-500">
            라이팅 스튜디오
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
            히스토리
          </h1>
        </div>
        <Link
          href="/writing/new"
          className="rounded-xl bg-plum-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-plum-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
        >
          새 작문
        </Link>
      </header>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="문제 내용 검색"
          className="flex-1 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
        <select
          name="mode"
          defaultValue={mode ?? ""}
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        >
          <option value="">모든 종류</option>
          <option value="écrit">Écrit</option>
          <option value="oral">Oral</option>
        </select>
        <button
          type="submit"
          className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
        >
          검색
        </button>
      </form>

      {!writings || writings.length === 0 ? (
        <p className="rounded-2xl border border-ink-200 bg-ink-50 px-6 py-8 text-center text-sm text-ink-500">
          {q || mode
            ? "조건에 맞는 작문이 없습니다."
            : "아직 작성한 글이 없습니다. 새 작문을 시작해보세요."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {writings.map((w) => (
            <li key={w.id}>
              <Link
                href={`/writing/${w.id}`}
                className="flex flex-col gap-1 rounded-2xl border border-ink-200 bg-ink-50 p-4 transition hover:border-plum-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-plum-50 px-2.5 py-0.5 text-xs font-medium text-plum-700">
                    {w.mode}
                  </span>
                  <span className="text-xs text-ink-500">
                    {new Date(w.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-ink-900">
                  {w.prompt || "(문제 없음)"}
                </p>
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span>{w.word_count}단어</span>
                  {w.score && (
                    <span className="font-medium text-plum-600">
                      {w.score.total.points}/{w.score.total.max}점
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

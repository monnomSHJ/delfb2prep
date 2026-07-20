import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Idea } from "@/lib/ideas/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아이디어 뱅크",
};

export default async function IdeasListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("ideas")
    .select("*")
    .order("topic", { ascending: true })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`topic.ilike.%${q}%,content.ilike.%${q}%`);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data: ideas } = await query.returns<Idea[]>();

  const grouped = new Map<string, Idea[]>();
  for (const idea of ideas ?? []) {
    const key = idea.topic || "주제 없음";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(idea);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-plum-500">
            Banque d&apos;idées
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
            아이디어 뱅크
          </h1>
        </div>
        <Link
          href="/ideas/new"
          className="rounded-xl bg-plum-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-plum-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
        >
          새 아이디어
        </Link>
      </header>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="주제·내용 검색"
          className="flex-1 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
        <input
          type="text"
          name="tag"
          defaultValue={tag ?? ""}
          placeholder="태그"
          className="w-32 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
        <button
          type="submit"
          className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
        >
          검색
        </button>
      </form>

      {grouped.size === 0 ? (
        <p className="rounded-2xl border border-ink-200 bg-ink-50 px-6 py-8 text-center text-sm text-ink-500">
          {q || tag
            ? "조건에 맞는 아이디어가 없습니다."
            : "아직 등록한 아이디어가 없습니다. 새 아이디어를 추가해보세요."}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {[...grouped.entries()].map(([topic, items]) => (
            <section key={topic} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="font-display text-base font-semibold text-ink-900">
                  {topic}
                </h2>
                <span className="text-xs text-ink-500">{items.length}개</span>
              </div>
              <ul className="flex flex-col gap-3">
                {items.map((idea) => (
                  <li key={idea.id}>
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="flex flex-col gap-1 rounded-2xl border border-ink-200 bg-ink-50 p-4 transition hover:border-plum-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
                    >
                      <p className="line-clamp-2 text-sm text-ink-900">
                        {idea.content || "(내용 없음)"}
                      </p>
                      {idea.source && (
                        <p className="text-xs text-ink-500">출처: {idea.source}</p>
                      )}
                      {idea.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {idea.tags.map((t) => (
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
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

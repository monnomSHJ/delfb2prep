import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Writing } from "@/lib/writing/types";

const PLACEHOLDER_CARDS = [
  {
    title: "점수 추이",
    empty: "첨삭 결과를 import하면 여기에 점수 추이가 표시됩니다.",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: recentWritings } = await supabase
    .from("writings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<Writing[]>();

  const today = new Date().toISOString().slice(0, 10);
  const { count: dueCount } = await supabase
    .from("vocab")
    .select("*", { count: "exact", head: true })
    .lte("srs_due", today);

  const { count: ideaCount } = await supabase
    .from("ideas")
    .select("*", { count: "exact", head: true });
  const { data: ideaTopics } = await supabase.from("ideas").select("topic");
  const ideaTopicCount = new Set(
    (ideaTopics ?? []).map((i) => i.topic || "미분류"),
  ).size;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-plum-500">
            DELF B2
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
            대시보드
          </h1>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
          >
            로그아웃
          </button>
        </form>
      </header>

      <p className="text-sm text-ink-500">{user.email}로 로그인됨</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-ink-200 bg-ink-50 p-5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-900">
              최근 작문
            </h2>
            <Link
              href="/writing/new"
              className="text-sm font-medium text-plum-600 hover:underline"
            >
              새 작문 →
            </Link>
          </div>
          {!recentWritings || recentWritings.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">
              아직 작성한 글이 없습니다. 라이팅 스튜디오에서 첫 글을 써보세요.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {recentWritings.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/writing/${w.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-sm transition hover:bg-plum-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
                  >
                    <span className="line-clamp-1 text-ink-900">
                      {w.prompt || "(문제 없음)"}
                    </span>
                    <span className="shrink-0 text-xs text-ink-500">
                      {w.score
                        ? `${w.score.total.points}/${w.score.total.max}점`
                        : `${w.word_count}단어`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/writing"
            className="mt-3 inline-block text-sm text-ink-500 hover:underline"
          >
            히스토리 전체 보기 →
          </Link>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
          <h2 className="font-display text-base font-semibold text-ink-900">
            오늘의 복습
          </h2>
          <p className="mt-2 text-3xl font-semibold text-plum-600">
            {dueCount ?? 0}
            <span className="ml-1 text-sm font-normal text-ink-500">개</span>
          </p>
          <Link
            href="/review"
            className="mt-3 inline-block text-sm font-medium text-plum-600 hover:underline"
          >
            복습 시작 →
          </Link>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
          <h2 className="font-display text-base font-semibold text-ink-900">
            Banque d&apos;idées
          </h2>
          <p className="mt-2 text-3xl font-semibold text-plum-600">
            {ideaCount ?? 0}
            <span className="ml-1 text-sm font-normal text-ink-500">개</span>
          </p>
          <p className="mt-1 text-xs text-ink-500">{ideaTopicCount}개 주제</p>
          <Link
            href="/ideas"
            className="mt-3 inline-block text-sm font-medium text-plum-600 hover:underline"
          >
            아이디어 뱅크 →
          </Link>
        </section>

        {PLACEHOLDER_CARDS.map((card) => (
          <section
            key={card.title}
            className="rounded-2xl border border-ink-200 bg-ink-50 p-5"
          >
            <h2 className="font-display text-base font-semibold text-ink-900">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-ink-500">{card.empty}</p>
          </section>
        ))}
      </div>
    </main>
  );
}

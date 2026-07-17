import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const PLACEHOLDER_CARDS = [
  {
    title: "최근 작문",
    empty: "아직 작성한 글이 없습니다. 라이팅 스튜디오에서 첫 글을 써보세요.",
  },
  {
    title: "점수 추이",
    empty: "첨삭 결과를 import하면 여기에 점수 추이가 표시됩니다.",
  },
  {
    title: "오늘의 복습",
    empty: "복습 노트가 준비되면 오늘 복습할 카드 수가 표시됩니다.",
  },
  {
    title: "Banque d'idées",
    empty: "아이디어 뱅크가 준비되면 주제별 아이디어 수가 표시됩니다.",
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

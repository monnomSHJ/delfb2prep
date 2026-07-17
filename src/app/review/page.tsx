import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewSession } from "./review-session";
import type { VocabCard } from "@/lib/vocab/types";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const { data: cards } = await supabase
    .from("vocab")
    .select("*")
    .lte("srs_due", today)
    .order("srs_due", { ascending: true })
    .returns<VocabCard[]>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header>
        <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-plum-500">
          복습 노트
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
          오늘의 복습
        </h1>
      </header>

      <ReviewSession initialCards={cards ?? []} />
    </main>
  );
}

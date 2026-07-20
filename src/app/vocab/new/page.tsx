import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VocabForm } from "../vocab-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "새 카드",
};

export default async function NewVocabPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string; meaning?: string; example?: string }>;
}) {
  const { term, meaning, example } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header>
        <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-plum-500">
          복습 노트
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
          새 카드
        </h1>
      </header>

      <VocabForm
        variant="create"
        initial={
          term || meaning || example ? { term, meaning, example } : undefined
        }
      />
    </main>
  );
}

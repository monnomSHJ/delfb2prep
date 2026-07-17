import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VocabForm } from "../vocab-form";
import type { VocabCard } from "@/lib/vocab/types";

export default async function VocabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("vocab")
    .select("*")
    .eq("id", id)
    .single<VocabCard>();

  if (!card) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header>
        <Link
          href="/vocab"
          className="text-sm font-medium text-plum-600 hover:underline"
        >
          ← 목록
        </Link>
        <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
          {card.term || "제목 없는 카드"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          다음 복습일: {card.srs_due}
        </p>
      </header>

      <VocabForm
        variant="edit"
        id={card.id}
        initial={{
          type: card.type,
          term: card.term,
          meaning: card.meaning,
          example: card.example,
          tags: card.tags,
        }}
      />
    </main>
  );
}

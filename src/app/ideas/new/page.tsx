import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IdeaForm } from "../idea-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "새 아이디어",
};

export default async function NewIdeaPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; content?: string; source?: string }>;
}) {
  const { topic, content, source } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header>
        <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-plum-500">
          Banque d&apos;idées
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
          새 아이디어
        </h1>
      </header>

      <IdeaForm
        variant="create"
        initial={topic || content || source ? { topic, content, source } : undefined}
      />
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WritingForm } from "../writing-form";
import { GradingPanel } from "./grading-panel";
import type { Writing } from "@/lib/writing/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: writing } = await supabase
    .from("writings")
    .select("prompt")
    .eq("id", id)
    .single<Pick<Writing, "prompt">>();

  return { title: writing?.prompt ? writing.prompt.slice(0, 40) : "작문" };
}

export default async function WritingDetailPage({
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

  const { data: writing } = await supabase
    .from("writings")
    .select("*")
    .eq("id", id)
    .single<Writing>();

  if (!writing) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-ink-500 hover:text-plum-600 hover:underline"
            >
              ← 대시보드
            </Link>
            <span className="text-xs text-ink-300">·</span>
            <Link
              href="/writing"
              className="text-sm font-medium text-plum-600 hover:underline"
            >
              ← 히스토리
            </Link>
          </div>
          <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
            {writing.prompt ? writing.prompt.slice(0, 40) : "제목 없는 작문"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {new Date(writing.created_at).toLocaleString("ko-KR")}
          </p>
        </div>
      </header>

      <WritingForm
        variant="edit"
        id={writing.id}
        initial={{
          mode: writing.mode,
          prompt: writing.prompt,
          outline: writing.outline,
          body: writing.body,
        }}
      />

      <GradingPanel
        writingId={writing.id}
        mode={writing.mode}
        prompt={writing.prompt}
        outline={writing.outline}
        body={writing.body}
        score={writing.score}
        feedback={writing.feedback}
      />
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IdeaForm } from "../idea-form";
import type { Idea } from "@/lib/ideas/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: idea } = await supabase
    .from("ideas")
    .select("topic")
    .eq("id", id)
    .single<Pick<Idea, "topic">>();

  return { title: idea?.topic || "아이디어" };
}

export default async function IdeaDetailPage({
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

  const { data: idea } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .single<Idea>();

  if (!idea) notFound();

  const writingPrompt = [idea.topic, idea.content].filter(Boolean).join(" — ");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between gap-3">
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
              href="/ideas"
              className="text-sm font-medium text-plum-600 hover:underline"
            >
              ← 목록
            </Link>
          </div>
          <h1 className="font-display mt-1 text-2xl font-semibold text-ink-900">
            {idea.topic || "주제 없는 아이디어"}
          </h1>
        </div>
        <Link
          href={`/writing/new?prompt=${encodeURIComponent(writingPrompt)}`}
          className="shrink-0 rounded-xl border border-plum-500 px-4 py-2.5 text-sm font-medium text-plum-600 transition hover:bg-plum-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600"
        >
          라이팅 문제로 불러오기
        </Link>
      </header>

      <IdeaForm
        variant="edit"
        id={idea.id}
        initial={{
          topic: idea.topic,
          content: idea.content,
          source: idea.source,
          tags: idea.tags,
        }}
      />
    </main>
  );
}

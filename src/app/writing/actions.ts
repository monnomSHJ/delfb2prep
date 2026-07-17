"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { countWords } from "@/lib/writing/wordCount";
import { parseGradingResult } from "@/lib/writing/parseGradingResult";
import type { WritingMode } from "@/lib/writing/types";

type DraftInput = {
  mode: WritingMode;
  prompt: string;
  outline: string;
  body: string;
};

export async function createWriting(input: DraftInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("writings")
    .insert({
      user_id: user!.id,
      mode: input.mode,
      prompt: input.prompt,
      outline: input.outline,
      body: input.body,
      word_count: countWords(input.body),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/writing");
  redirect(`/writing/${data.id}`);
}

export async function updateDraft(id: string, input: DraftInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("writings")
    .update({
      mode: input.mode,
      prompt: input.prompt,
      outline: input.outline,
      body: input.body,
      word_count: countWords(input.body),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/writing/${id}`);
  revalidatePath("/writing");
}

export async function importFeedback(id: string, raw: string) {
  const supabase = await createClient();
  const result = parseGradingResult(raw);

  const { error } = await supabase
    .from("writings")
    .update({
      score: result.score,
      feedback: result.feedback,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/writing/${id}`);
  revalidatePath("/writing");
  revalidatePath("/dashboard");

  return result.ok;
}

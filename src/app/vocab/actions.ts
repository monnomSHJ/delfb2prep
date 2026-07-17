"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeNextReview, type ReviewGrade } from "@/lib/vocab/srs";
import type { VocabType } from "@/lib/vocab/types";

type CardInput = {
  type: VocabType;
  term: string;
  meaning: string;
  example: string;
  tags: string[];
};

export async function createCard(input: CardInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("vocab").insert({
    user_id: user!.id,
    type: input.type,
    term: input.term,
    meaning: input.meaning,
    example: input.example,
    tags: input.tags,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vocab");
  redirect("/vocab");
}

export async function updateCard(id: string, input: CardInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vocab")
    .update({
      type: input.type,
      term: input.term,
      meaning: input.meaning,
      example: input.example,
      tags: input.tags,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/vocab/${id}`);
  revalidatePath("/vocab");
}

export async function deleteCard(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("vocab").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vocab");
  revalidatePath("/review");
  revalidatePath("/dashboard");
  redirect("/vocab");
}

export async function gradeReview(id: string, grade: ReviewGrade) {
  const supabase = await createClient();

  const { data: card, error: fetchError } = await supabase
    .from("vocab")
    .select("srs_interval, ease, reps")
    .eq("id", id)
    .single();

  if (fetchError || !card) {
    throw new Error(fetchError?.message ?? "카드를 찾을 수 없습니다.");
  }

  const next = computeNextReview(
    grade,
    {
      srs_interval: card.srs_interval,
      ease: card.ease,
      reps: card.reps,
    },
    new Date(),
  );

  const { error } = await supabase
    .from("vocab")
    .update({
      srs_interval: next.srs_interval,
      ease: next.ease,
      reps: next.reps,
      srs_due: next.srs_due,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/review");
  revalidatePath("/dashboard");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type IdeaInput = {
  topic: string;
  content: string;
  source: string;
  tags: string[];
};

export async function createIdea(input: IdeaInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("ideas").insert({
    user_id: user!.id,
    topic: input.topic,
    content: input.content,
    source: input.source,
    tags: input.tags,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/ideas");
  revalidatePath("/dashboard");
  redirect("/ideas");
}

export async function updateIdea(id: string, input: IdeaInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ideas")
    .update({
      topic: input.topic,
      content: input.content,
      source: input.source,
      tags: input.tags,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/ideas/${id}`);
  revalidatePath("/ideas");
}

export async function deleteIdea(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("ideas").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/ideas");
  revalidatePath("/dashboard");
  redirect("/ideas");
}

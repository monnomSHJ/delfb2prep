"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-ink-200 bg-ink-50 px-6 py-8 text-center">
        <p className="text-lg font-medium text-ink-900">메일함을 확인하세요</p>
        <p className="mt-2 text-sm text-ink-500">
          {email}로 로그인 링크를 보냈습니다. 링크를 클릭하면 이 기기에서 로그인됩니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-left">
        <span className="text-sm font-medium text-ink-700">이메일</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-plum-500 focus:ring-2 focus:ring-plum-200"
        />
      </label>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-xl bg-plum-600 px-4 py-3 text-base font-medium text-white transition hover:bg-plum-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600 disabled:opacity-60"
      >
        {status === "sending" ? "보내는 중…" : "로그인 링크 받기"}
      </button>
    </form>
  );
}

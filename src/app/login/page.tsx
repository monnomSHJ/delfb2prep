import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-plum-500">
            DELF B2
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-ink-900">
            Atelier d&apos;écriture
          </h1>
          <p className="mt-3 text-sm text-ink-500">
            이메일로 로그인 링크를 받아 시작하세요.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

-- Phase 1: 라이팅 스튜디오 — writings 테이블 (SPEC.md §3, §7)

create table if not exists public.writings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('écrit', 'oral')),
  prompt text not null default '',
  outline text not null default '',
  body text not null default '',
  word_count integer not null default 0,
  score jsonb,
  feedback jsonb,
  created_at timestamptz not null default now()
);

create index if not exists writings_user_id_created_at_idx
  on public.writings (user_id, created_at desc);

alter table public.writings enable row level security;

create policy "writings_select_own"
  on public.writings for select
  using (auth.uid() = user_id);

create policy "writings_insert_own"
  on public.writings for insert
  with check (auth.uid() = user_id);

create policy "writings_update_own"
  on public.writings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "writings_delete_own"
  on public.writings for delete
  using (auth.uid() = user_id);

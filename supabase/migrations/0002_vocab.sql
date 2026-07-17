-- Phase 2: 복습 노트 + SRS — vocab 테이블 (SPEC.md §3, §7)

create table if not exists public.vocab (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('word', 'expression', 'structure')),
  term text not null default '',
  meaning text not null default '',
  example text not null default '',
  tags text[] not null default '{}',
  srs_due date not null default current_date,
  srs_interval integer not null default 0,
  ease real not null default 2.5,
  reps integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists vocab_user_id_srs_due_idx
  on public.vocab (user_id, srs_due);

create index if not exists vocab_user_id_tags_idx
  on public.vocab using gin (tags);

alter table public.vocab enable row level security;

create policy "vocab_select_own"
  on public.vocab for select
  using (auth.uid() = user_id);

create policy "vocab_insert_own"
  on public.vocab for insert
  with check (auth.uid() = user_id);

create policy "vocab_update_own"
  on public.vocab for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "vocab_delete_own"
  on public.vocab for delete
  using (auth.uid() = user_id);

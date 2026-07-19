-- Phase 3: 아이디어 뱅크 — ideas 테이블 (SPEC.md §3, §7)

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null default '',
  content text not null default '',
  source text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists ideas_user_id_topic_idx
  on public.ideas (user_id, topic);

create index if not exists ideas_user_id_tags_idx
  on public.ideas using gin (tags);

alter table public.ideas enable row level security;

create policy "ideas_select_own"
  on public.ideas for select
  using (auth.uid() = user_id);

create policy "ideas_insert_own"
  on public.ideas for insert
  with check (auth.uid() = user_id);

create policy "ideas_update_own"
  on public.ideas for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ideas_delete_own"
  on public.ideas for delete
  using (auth.uid() = user_id);

-- Feedback table
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  name        text,
  message     text not null,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- RLS: anyone authenticated can insert; only admin reads via service role
alter table public.feedback enable row level security;

-- Authenticated users can submit feedback
create policy "Users can submit feedback"
  on public.feedback for insert
  to authenticated
  with check (true);

-- Users can also submit when not logged in (anon)
create policy "Anon can submit feedback"
  on public.feedback for insert
  to anon
  with check (true);

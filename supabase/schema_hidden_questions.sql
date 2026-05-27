-- Run this in the Supabase SQL editor to create the hidden_questions table

create table if not exists public.hidden_questions (
  question_id integer primary key,
  created_at  timestamptz default now()
);

-- Only the service-role key (admin API) can read/write — no RLS needed for regular users
alter table public.hidden_questions enable row level security;

-- No policies: anon/authenticated users cannot read or write.
-- Admin API bypasses RLS via the service role key.

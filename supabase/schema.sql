-- =====================================================
-- JUGEND LERNAPP - SUPABASE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── User Profiles ────────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default 'Nutzer',
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ─── User Stats ───────────────────────────────────────────────────────────────
create table if not exists public.user_stats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  xp integer default 0 not null,
  level integer default 1 not null,
  streak integer default 0 not null,
  last_activity_date date,
  total_tests integer default 0 not null,
  average_score float default 0 not null,
  best_score float default 0 not null,
  total_questions_answered integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ─── Test Sessions ────────────────────────────────────────────────────────────
create table if not exists public.test_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mode text check (mode in ('lernen', 'simulation')) not null,
  total_score float default 0 not null,
  max_score float default 0 not null,
  percentage float default 0 not null,
  questions_count integer default 0 not null,
  xp_earned integer default 0 not null,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

-- ─── Test Answers ─────────────────────────────────────────────────────────────
create table if not exists public.test_answers (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.test_sessions(id) on delete cascade not null,
  question_id integer not null,
  question_text text not null,
  user_answer text not null,
  expected_answer text not null,
  score float default 0 not null,
  max_score float not null,
  percentage float default 0 not null,
  feedback text,
  difficulty text check (difficulty in ('leicht', 'mittel', 'schwer')) not null,
  category text not null,
  created_at timestamptz default now() not null
);

-- ─── Questions (for PDF imports) ─────────────────────────────────────────────
create table if not exists public.questions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  question_number integer,
  category text not null,
  question text not null,
  answer text not null,
  difficulty text check (difficulty in ('leicht', 'mittel', 'schwer')) not null default 'mittel',
  points integer not null default 2,
  requires_brackets boolean default false,
  requires_order boolean default false,
  hint text,
  is_default boolean default false,
  created_at timestamptz default now() not null
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.user_profiles enable row level security;
alter table public.user_stats enable row level security;
alter table public.test_sessions enable row level security;
alter table public.test_answers enable row level security;
alter table public.questions enable row level security;

-- Policies for user_profiles
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Policies for user_stats
create policy "Users can view their own stats"
  on public.user_stats for select
  using (auth.uid() = user_id);

create policy "Users can update their own stats"
  on public.user_stats for update
  using (auth.uid() = user_id);

create policy "Users can insert their own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

-- Policies for test_sessions
create policy "Users can view their own sessions"
  on public.test_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.test_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on public.test_sessions for update
  using (auth.uid() = user_id);

-- Policies for test_answers
create policy "Users can view their own answers"
  on public.test_answers for select
  using (
    session_id in (
      select id from public.test_sessions where user_id = auth.uid()
    )
  );

create policy "Users can insert their own answers"
  on public.test_answers for insert
  with check (
    session_id in (
      select id from public.test_sessions where user_id = auth.uid()
    )
  );

-- Policies for questions
create policy "Default questions are visible to all authenticated users"
  on public.questions for select
  using (is_default = true or auth.uid() = user_id);

create policy "Users can insert their own questions"
  on public.questions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own questions"
  on public.questions for update
  using (auth.uid() = user_id);

-- ─── Triggers ─────────────────────────────────────────────────────────────────

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  insert into public.user_stats (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.update_updated_at();

create trigger update_user_stats_updated_at
  before update on public.user_stats
  for each row execute procedure public.update_updated_at();

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_test_sessions_user_id on public.test_sessions(user_id);
create index if not exists idx_test_answers_session_id on public.test_answers(session_id);
create index if not exists idx_user_stats_user_id on public.user_stats(user_id);
create index if not exists idx_questions_user_id on public.questions(user_id);

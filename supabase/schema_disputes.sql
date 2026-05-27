-- =====================================================
-- DISPUTES & APPROVED VARIANTS MIGRATION
-- Run this in the Supabase SQL Editor
-- =====================================================

-- 1. Add dispute_feature_enabled flag to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS dispute_feature_enabled boolean NOT NULL DEFAULT true;

-- 2. answer_disputes: user requests to approve their answer
CREATE TABLE IF NOT EXISTS public.answer_disputes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id integer NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_answer text NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.answer_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own disputes"
  ON public.answer_disputes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own disputes"
  ON public.answer_disputes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. approved_answer_variants: accepted alternative correct answers
CREATE TABLE IF NOT EXISTS public.approved_answer_variants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  integer NOT NULL,
  variant_text text NOT NULL,
  dispute_id   uuid REFERENCES public.answer_disputes(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.approved_answer_variants ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read variants (needed for evaluation pre-check)
CREATE POLICY "Authenticated users can read variants"
  ON public.approved_answer_variants FOR SELECT
  TO authenticated
  USING (true);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_user_id  ON public.answer_disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_question ON public.answer_disputes(question_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status   ON public.answer_disputes(status);
CREATE INDEX IF NOT EXISTS idx_variants_question ON public.approved_answer_variants(question_id);

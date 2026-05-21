-- =====================================================
-- GRUPPEN-FEATURE MIGRATION
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Add group_ids column (for matching with other users)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS group_ids text[] DEFAULT '{}';

-- Add group_names column (local map: id → custom name)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS group_names jsonb DEFAULT '{}';

-- Index for fast group membership queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_group_ids
  ON public.user_profiles USING GIN(group_ids);

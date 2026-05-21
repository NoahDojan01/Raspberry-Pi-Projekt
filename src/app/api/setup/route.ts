import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MIGRATION_SQL = `ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS group_ids text[] DEFAULT '{}';
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS group_names jsonb DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_user_profiles_group_ids
  ON public.user_profiles USING GIN(group_ids);`

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { error } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  const migrationNeeded = !!error?.message?.toLowerCase().includes('column')

  return NextResponse.json({
    migrationNeeded,
    sql: migrationNeeded ? MIGRATION_SQL : null,
    instructions: migrationNeeded
      ? 'Öffne den Supabase SQL Editor (supabase.com → dein Projekt → SQL Editor) und führe den SQL-Code aus.'
      : null,
  })
}

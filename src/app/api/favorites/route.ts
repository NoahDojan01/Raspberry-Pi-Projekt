import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const MIGRATION_CHECK_MSG = 'Die Favoriten-Spalte fehlt. Bitte führe die Migration aus: ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS favorite_user_ids text[] DEFAULT \'{}\';'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: profile, error: readError } = await supabase
    .from('user_profiles')
    .select('favorite_user_ids')
    .eq('id', user.id)
    .single()

  if (readError?.message?.toLowerCase().includes('column')) {
    return NextResponse.json({ favorites: [], favoriteIds: [], migrationNeeded: true, message: MIGRATION_CHECK_MSG })
  }

  const favoriteIds: string[] = profile?.favorite_user_ids ?? []
  if (!favoriteIds.length) return NextResponse.json({ favorites: [], favoriteIds: [] })

  const admin = await createAdminClient()
  const [{ data: profiles }, { data: stats }] = await Promise.all([
    admin.from('user_profiles').select('id, name').in('id', favoriteIds),
    admin.from('user_stats')
      .select('user_id, xp, level, streak, total_tests, best_score, average_score')
      .in('user_id', favoriteIds),
  ])

  const statsMap = Object.fromEntries((stats ?? []).map(s => [s.user_id, s]))
  const favorites = (profiles ?? []).map(p => ({
    userId: p.id,
    name: p.name,
    xp: statsMap[p.id]?.xp ?? 0,
    level: statsMap[p.id]?.level ?? 1,
    streak: statsMap[p.id]?.streak ?? 0,
    total_tests: statsMap[p.id]?.total_tests ?? 0,
    best_score: statsMap[p.id]?.best_score ?? 0,
    average_score: statsMap[p.id]?.average_score ?? 0,
  }))

  return NextResponse.json({ favorites, favoriteIds })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { userId } = await request.json()
  if (!userId || userId === user.id) {
    return NextResponse.json({ error: 'Ungültige Nutzer-ID' }, { status: 400 })
  }

  const { data: profile, error: readError } = await supabase
    .from('user_profiles')
    .select('favorite_user_ids')
    .eq('id', user.id)
    .single()

  if (readError?.message?.toLowerCase().includes('column')) {
    return NextResponse.json({ error: 'migration_needed', message: MIGRATION_CHECK_MSG }, { status: 503 })
  }

  const current: string[] = profile?.favorite_user_ids ?? []
  if (current.includes(userId)) return NextResponse.json({ favoriteIds: current })
  if (current.length >= 20) return NextResponse.json({ error: 'Maximal 20 Favoriten möglich' }, { status: 400 })

  const updated = [...current, userId]
  const { error } = await supabase.from('user_profiles').update({ favorite_user_ids: updated }).eq('id', user.id)
  if (error) return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })

  return NextResponse.json({ favoriteIds: updated })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { userId } = await request.json()

  const { data: profile, error: readError } = await supabase
    .from('user_profiles')
    .select('favorite_user_ids')
    .eq('id', user.id)
    .single()

  if (readError?.message?.toLowerCase().includes('column')) {
    return NextResponse.json({ error: 'migration_needed', message: MIGRATION_CHECK_MSG }, { status: 503 })
  }

  const updated = (profile?.favorite_user_ids ?? []).filter((id: string) => id !== userId)
  const { error } = await supabase.from('user_profiles').update({ favorite_user_ids: updated }).eq('id', user.id)
  if (error) return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })

  return NextResponse.json({ favoriteIds: updated })
}

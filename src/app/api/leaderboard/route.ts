import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get('groupId')
  if (!groupId) return NextResponse.json({ error: 'groupId fehlt' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  // Use admin client to read other users' data
  const admin = await createAdminClient()

  const { data: profiles } = await admin
    .from('user_profiles')
    .select('id, name')
    .contains('group_ids', [groupId])

  if (!profiles?.length) return NextResponse.json({ entries: [] })

  const userIds = profiles.map((p) => p.id)

  const { data: stats } = await admin
    .from('user_stats')
    .select('user_id, xp, level, streak, total_tests, best_score')
    .in('user_id', userIds)
    .order('xp', { ascending: false })
    .limit(50)

  const nameMap = Object.fromEntries(profiles.map((p) => [p.id, p.name]))

  const entries = (stats ?? []).map((s, i) => ({
    rank: i + 1,
    userId: s.user_id,
    name: nameMap[s.user_id] ?? 'Unbekannt',
    xp: s.xp,
    level: s.level,
    streak: s.streak,
    totalTests: s.total_tests,
    bestScore: s.best_score,
    isMe: s.user_id === user.id,
  }))

  return NextResponse.json({ entries })
}

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

  const nameMap = Object.fromEntries(profiles.map((p) => [p.id, p.name]))
  const statsMap = Object.fromEntries((stats ?? []).map((s) => [s.user_id, s]))

  const sorted = userIds
    .map((id) => ({
      userId: id,
      name: nameMap[id] ?? 'Unbekannt',
      xp: statsMap[id]?.xp ?? 0,
      level: statsMap[id]?.level ?? 1,
      streak: statsMap[id]?.streak ?? 0,
      totalTests: statsMap[id]?.total_tests ?? 0,
      bestScore: statsMap[id]?.best_score ?? 0,
      isMe: id === user.id,
    }))
    .sort((a, b) => b.xp - a.xp)

  const entries = sorted.map((e, i) => ({ ...e, rank: i + 1 }))

  return NextResponse.json({ entries })
}

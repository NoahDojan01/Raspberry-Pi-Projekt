import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { userId: targetId } = await params
  if (!targetId) return NextResponse.json({ error: 'Nutzer-ID fehlt' }, { status: 400 })
  if (targetId === user.id) return NextResponse.json({ error: 'Kein Zugriff auf eigenes Profil hier' }, { status: 400 })

  const { data: myProfile } = await supabase
    .from('user_profiles')
    .select('favorite_user_ids, group_ids')
    .eq('id', user.id)
    .single()

  const isFavorited = (myProfile?.favorite_user_ids ?? []).includes(targetId)

  if (!isFavorited) {
    const myGroups: string[] = myProfile?.group_ids ?? []
    if (!myGroups.length) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })

    const admin = await createAdminClient()
    const { data: targetProfile } = await admin
      .from('user_profiles')
      .select('group_ids')
      .eq('id', targetId)
      .single()

    const targetGroups: string[] = targetProfile?.group_ids ?? []
    const sharesGroup = myGroups.some(g => targetGroups.includes(g))
    if (!sharesGroup) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
  }

  const admin = await createAdminClient()
  const [{ data: profile }, { data: stats }, { data: sessions }] = await Promise.all([
    admin.from('user_profiles').select('name').eq('id', targetId).single(),
    admin.from('user_stats')
      .select('xp, level, streak, total_tests, average_score, best_score, total_questions_answered')
      .eq('user_id', targetId).single(),
    admin.from('test_sessions')
      .select('id, mode, percentage, total_score, max_score, questions_count, xp_earned, completed_at')
      .eq('user_id', targetId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10),
  ])

  return NextResponse.json({
    name: profile?.name ?? 'Unbekannt',
    stats: stats ?? null,
    sessions: sessions ?? [],
  })
}

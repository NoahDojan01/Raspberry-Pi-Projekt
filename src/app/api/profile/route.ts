import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase.from('user_profiles').select('name, group_ids, group_names, dispute_feature_enabled, theme_preference').eq('id', user.id).single(),
    supabase.from('user_stats')
      .select('xp, level, streak, total_tests, average_score, best_score, total_questions_answered')
      .eq('user_id', user.id).single(),
  ])

  return NextResponse.json({
    name: profile?.name ?? '',
    email: user.email ?? '',
    stats: stats ?? null,
    group_ids: profile?.group_ids ?? [],
    group_names: profile?.group_names ?? {},
    dispute_feature_enabled: profile?.dispute_feature_enabled ?? true,
    theme_preference: profile?.theme_preference ?? null,
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const body = await request.json()

  if (body.name !== undefined) {
    const name = body.name.trim()
    if (!name) return NextResponse.json({ error: 'Name darf nicht leer sein' }, { status: 400 })

    const { error } = await supabase.from('user_profiles').update({ name }).eq('id', user.id)
    if (error) return NextResponse.json({ error: 'Name konnte nicht gespeichert werden' }, { status: 500 })
    return NextResponse.json({ success: true, message: 'Name gespeichert' })
  }

  if (body.email !== undefined) {
    const email = body.email.trim()
    if (!email) return NextResponse.json({ error: 'E-Mail darf nicht leer sein' }, { status: 400 })

    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` }
    )
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({
      success: true,
      message: 'Bestätigungs-E-Mail an die neue Adresse gesendet. Bitte bestätige den Link in der Mail.',
    })
  }

  if (body.theme_preference !== undefined) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ theme_preference: body.theme_preference })
      .eq('id', user.id)
    if (error) return NextResponse.json({ error: 'Einstellung konnte nicht gespeichert werden' }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Keine gültigen Felder angegeben' }, { status: 400 })
}

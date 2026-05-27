import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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
    const newName = body.name.trim()
    if (!newName) return NextResponse.json({ error: 'Name darf nicht leer sein' }, { status: 400 })

    const { data: profile } = await supabase.from('user_profiles').select('name').eq('id', user.id).single()
    const oldName = profile?.name ?? ''

    const admin = await createAdminClient()
    const { error } = await admin.from('name_change_requests').insert({
      user_id: user.id,
      old_name: oldName,
      new_name: newName,
    })
    if (error) return NextResponse.json({ error: 'Anfrage konnte nicht gesendet werden' }, { status: 500 })
    return NextResponse.json({ success: true, pending: true, message: 'Namensänderung zur Genehmigung eingereicht' })
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

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { questionId, userAnswer } = await request.json()
  if (!questionId || !userAnswer?.trim()) {
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: profile } = await admin
    .from('user_profiles')
    .select('dispute_feature_enabled')
    .eq('id', user.id)
    .single()

  if (profile?.dispute_feature_enabled === false) {
    return NextResponse.json({ error: 'Funktion deaktiviert' }, { status: 403 })
  }

  const { error } = await admin.from('answer_disputes').insert({
    question_id: questionId,
    user_id: user.id,
    user_answer: userAnswer.trim(),
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

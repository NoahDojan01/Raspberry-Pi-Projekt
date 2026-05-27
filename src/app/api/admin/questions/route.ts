import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, hidden } = await request.json() as { id: number; hidden: boolean }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const admin = await createAdminClient()
  if (hidden) {
    await admin.from('hidden_questions').upsert({ question_id: id }, { onConflict: 'question_id', ignoreDuplicates: true })
  } else {
    await admin.from('hidden_questions').delete().eq('question_id', id)
  }
  return NextResponse.json({ ok: true })
}

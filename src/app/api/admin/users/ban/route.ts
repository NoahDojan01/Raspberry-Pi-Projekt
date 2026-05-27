import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function PATCH(request: Request) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, bannedUntil } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId fehlt' }, { status: 400 })

  const admin = await createAdminClient()
  const { error } = await admin
    .from('user_profiles')
    .update({ banned_until: bannedUntil ?? null })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function PATCH(request: Request) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, enabled } = await request.json() as { userId: string; enabled: boolean }
  if (!userId || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { error } = await admin
    .from('user_profiles')
    .update({ dispute_feature_enabled: enabled })
    .eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

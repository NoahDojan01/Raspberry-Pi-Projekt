import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function GET() {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('app_settings')
    .select('maintenance_enabled, maintenance_until, maintenance_message')
    .eq('id', 1)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const update: Record<string, unknown> = {}
  if (body.enabled !== undefined) update.maintenance_enabled = body.enabled
  if (body.until !== undefined) update.maintenance_until = body.until ?? null
  if (body.message !== undefined) update.maintenance_message = body.message

  const admin = await createAdminClient()
  const { error } = await admin.from('app_settings').update(update).eq('id', 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

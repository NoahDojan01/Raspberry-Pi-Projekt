import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action } = await request.json()
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: req, error: fetchError } = await admin
    .from('name_change_requests')
    .select('user_id, new_name')
    .eq('id', id)
    .single()

  if (fetchError || !req) return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 })

  if (action === 'approve') {
    await admin.from('user_profiles').update({ name: req.new_name }).eq('id', req.user_id)
  }

  const { error } = await admin
    .from('name_change_requests')
    .update({ status: action === 'approve' ? 'approved' : 'rejected', resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

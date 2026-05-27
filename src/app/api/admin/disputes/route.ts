import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function GET(request: Request) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const admin = await createAdminClient()
  let query = admin
    .from('answer_disputes')
    .select('id, question_id, user_id, user_answer, status, created_at, resolved_at')
    .order('created_at', { ascending: false })

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query = query.eq('status', status)
  }

  const { data: disputes, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = [...new Set((disputes ?? []).map(d => d.user_id))]
  const { data: profiles } = userIds.length
    ? await admin.from('user_profiles').select('id, name').in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.name ?? '—']))

  const enriched = (disputes ?? []).map(d => ({
    ...d,
    userName: profileMap[d.user_id] ?? '—',
  }))

  return NextResponse.json({ disputes: enriched })
}

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function GET() {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = await createAdminClient()
  const { data: requests, error } = await admin
    .from('name_change_requests')
    .select('id, user_id, old_name, new_name, status, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = [...new Set((requests ?? []).map(r => r.user_id))]
  const emailMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 })
    for (const u of (authUsers?.users ?? [])) {
      emailMap[u.id] = u.email ?? ''
    }
  }

  const enriched = (requests ?? []).map(r => ({
    ...r,
    email: emailMap[r.user_id] ?? '',
  }))

  return NextResponse.json({ requests: enriched })
}

import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'
import { redirect } from 'next/navigation'
import AdminNameChangesClient from './AdminNameChangesClient'

export const dynamic = 'force-dynamic'

export default async function AdminNameChangesPage() {
  const result = await assertAdmin()
  if (!result) redirect('/dashboard')

  const admin = await createAdminClient()
  const { data: requests } = await admin
    .from('name_change_requests')
    .select('id, user_id, old_name, new_name, status, created_at')
    .order('created_at', { ascending: false })

  const userIds = [...new Set((requests ?? []).map(r => r.user_id))]
  const emailMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 })
    for (const u of (authUsers?.users ?? [])) {
      emailMap[u.id] = u.email ?? ''
    }
  }

  const enriched = (requests ?? []).map(r => ({
    id: r.id as string,
    user_id: r.user_id as string,
    old_name: r.old_name as string,
    new_name: r.new_name as string,
    status: r.status as 'pending' | 'approved' | 'rejected',
    created_at: r.created_at as string,
    email: emailMap[r.user_id as string] ?? '',
  }))

  return <AdminNameChangesClient initialRequests={enriched} />
}

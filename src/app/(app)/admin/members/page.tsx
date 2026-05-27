import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin, isSuperAdminEmail } from '@/lib/auth/admin'
import { redirect } from 'next/navigation'
import AdminMembersClient from './AdminMembersClient'

export const dynamic = 'force-dynamic'

export default async function AdminMembersPage() {
  const result = await assertAdmin()
  if (!result) redirect('/dashboard')

  const admin = await createAdminClient()

  const { data: profiles } = await admin
    .from('user_profiles')
    .select('id, name, created_at, is_admin')
    .order('created_at', { ascending: false })

  const ids = (profiles ?? []).map(p => p.id)

  const { data: stats } = ids.length
    ? await admin.from('user_stats').select('user_id, xp, level, streak, total_tests').in('user_id', ids)
    : { data: [] }

  // Need emails to protect super-admin row in the UI
  const { data: authUsers } = ids.length
    ? await admin.auth.admin.listUsers({ perPage: 1000 })
    : { data: { users: [] } }

  const emailMap = Object.fromEntries(
    ((authUsers as { users?: { id: string; email?: string }[] })?.users ?? []).map(u => [u.id, u.email ?? ''])
  )

  const statsMap = Object.fromEntries((stats ?? []).map(s => [s.user_id, s]))

  const members = (profiles ?? []).map(p => ({
    id: p.id,
    name: p.name ?? '—',
    email: emailMap[p.id] ?? '—',
    created_at: p.created_at as string,
    is_admin: p.is_admin ?? false,
    isSuperAdmin: isSuperAdminEmail(emailMap[p.id]),
    xp: statsMap[p.id]?.xp ?? 0,
    level: statsMap[p.id]?.level ?? 1,
    streak: statsMap[p.id]?.streak ?? 0,
    total_tests: statsMap[p.id]?.total_tests ?? 0,
  }))

  return <AdminMembersClient members={members} isSuperAdmin={result.isSuperAdmin} />
}

import { createAdminClient, createClient } from '@/lib/supabase/server'
import AdminOverviewClient from './AdminOverviewClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [supabase, admin] = await Promise.all([createClient(), createAdminClient()])

  const [usersRes, feedbackRes, sessionsRes, disputesRes] = await Promise.all([
    admin.from('user_profiles').select('id', { count: 'exact', head: true }),
    admin.from('feedback').select('id', { count: 'exact', head: true }),
    admin.from('test_sessions').select('id', { count: 'exact', head: true }),
    admin.from('answer_disputes').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const openFeedbackRes = await admin
    .from('feedback')
    .select('id', { count: 'exact', head: true })
    .eq('resolved', false)

  return (
    <AdminOverviewClient
      totalUsers={usersRes.count ?? 0}
      totalFeedback={feedbackRes.count ?? 0}
      openFeedback={openFeedbackRes.count ?? 0}
      totalSessions={sessionsRes.count ?? 0}
      pendingDisputes={disputesRes.count ?? 0}
    />
  )
}

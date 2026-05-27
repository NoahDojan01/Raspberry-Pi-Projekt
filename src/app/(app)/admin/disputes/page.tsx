import { createAdminClient } from '@/lib/supabase/server'
import AdminDisputesClient from './AdminDisputesClient'

export const dynamic = 'force-dynamic'

export default async function AdminDisputesPage() {
  const admin = await createAdminClient()

  const { data: disputes } = await admin
    .from('answer_disputes')
    .select('id, question_id, user_id, user_answer, status, created_at, resolved_at')
    .order('created_at', { ascending: false })

  const userIds = [...new Set((disputes ?? []).map(d => d.user_id))]
  const { data: profiles } = userIds.length
    ? await admin.from('user_profiles').select('id, name, dispute_feature_enabled').in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, { name: p.name ?? '—', featureEnabled: p.dispute_feature_enabled ?? true }]))

  const questionIds = [...new Set((disputes ?? []).map(d => d.question_id))]
  const { data: variants } = questionIds.length
    ? await admin.from('approved_answer_variants').select('id, question_id, variant_text, dispute_id, created_at').in('question_id', questionIds)
    : { data: [] }

  const enriched = (disputes ?? []).map(d => ({
    ...d,
    userName: profileMap[d.user_id]?.name ?? '—',
  }))

  const usersForToggle = (profiles ?? []).map(p => ({
    id: p.id,
    name: p.name ?? '—',
    featureEnabled: p.dispute_feature_enabled ?? true,
  }))

  return (
    <AdminDisputesClient
      initialDisputes={enriched}
      initialVariants={variants ?? []}
      usersForToggle={usersForToggle}
    />
  )
}

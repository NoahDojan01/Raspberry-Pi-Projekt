import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [statsResult, sessionsResult, profileResult] = await Promise.all([
    supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
    supabase
      .from('test_sessions')
      .select('id, mode, percentage, total_score, max_score, questions_count, xp_earned, completed_at')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10),
    supabase.from('user_profiles').select('name').eq('id', user.id).single(),
  ])

  return (
    <DashboardClient
      stats={statsResult.data}
      recentSessions={sessionsResult.data || []}
      userName={profileResult.data?.name || 'Nutzer'}
    />
  )
}

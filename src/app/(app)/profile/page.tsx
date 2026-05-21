import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase.from('user_profiles').select('name').eq('id', user.id).single(),
    supabase.from('user_stats')
      .select('xp, level, streak, total_tests, average_score, best_score, total_questions_answered')
      .eq('user_id', user.id).single(),
  ])

  return (
    <ProfileClient
      initialName={profile?.name ?? ''}
      email={user.email ?? ''}
      stats={stats}
    />
  )
}

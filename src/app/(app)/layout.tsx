import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: stats } = await supabase
    .from('user_stats')
    .select('xp, level, streak')
    .eq('user_id', user.id)
    .single()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#05030f]">
      <Sidebar
        userName={profile?.name || user.email?.split('@')[0] || 'Nutzer'}
        userLevel={stats?.level || 1}
        userXP={stats?.xp || 0}
        userStreak={stats?.streak || 0}
      />
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

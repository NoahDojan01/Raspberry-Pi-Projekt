import { SpeedInsights } from '@vercel/speed-insights/next';
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [statsResult, profileResult] = await Promise.all([
    supabase.from('user_stats').select('xp, level, streak').eq('user_id', user.id).single(),
    supabase.from('user_profiles').select('name').eq('id', user.id).single(),
  ])

  // Ensure both rows exist — runs silently if they're already there
  if (!profileResult.data) {
    await supabase.from('user_profiles').upsert(
      {
        id: user.id,
        name: (user.user_metadata?.name as string | undefined)
          ?? user.email?.split('@')[0]
          ?? 'Nutzer',
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }
  if (!statsResult.data) {
    await supabase.from('user_stats').upsert(
      { user_id: user.id },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
  }

  return (
    <div className="min-h-screen bg-[#05030f]">
      <Sidebar
        userName={
          profileResult.data?.name
          ?? (user.user_metadata?.name as string | undefined)
          ?? user.email?.split('@')[0]
          ?? 'Nutzer'
        }
        userLevel={statsResult.data?.level ?? 1}
        userXP={statsResult.data?.xp ?? 0}
        userStreak={statsResult.data?.streak ?? 0}
      />
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
          <SpeedInsights />

        </div>
      </main>
    </div>
  )
}

import { SpeedInsights } from '@vercel/speed-insights/next';
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { isSuperAdminEmail } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [statsResult, profileResult] = await Promise.all([
    supabase.from('user_stats').select('xp, level, streak').eq('user_id', user.id).single(),
    supabase.from('user_profiles').select('name, is_admin').eq('id', user.id).single(),
  ])

  if (!profileResult.data) {
    await supabase.from('user_profiles').upsert(
      { id: user.id, name: (user.user_metadata?.name as string | undefined) ?? user.email?.split('@')[0] ?? 'Nutzer' },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }
  if (!statsResult.data) {
    await supabase.from('user_stats').upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true })
  }

  const isAdmin = isSuperAdminEmail(user.email) || (profileResult.data?.is_admin ?? false)

  return (
    <AppShell
      userName={profileResult.data?.name ?? (user.user_metadata?.name as string | undefined) ?? user.email?.split('@')[0] ?? 'Nutzer'}
      userLevel={statsResult.data?.level ?? 1}
      userXP={statsResult.data?.xp ?? 0}
      userStreak={statsResult.data?.streak ?? 0}
      isAdmin={isAdmin}
    >
      {children}
      <SpeedInsights />
    </AppShell>
  )
}

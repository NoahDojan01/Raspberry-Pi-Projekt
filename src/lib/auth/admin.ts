import { createClient, createAdminClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

export function isSuperAdminEmail(email: string | undefined): boolean {
  return Boolean(ADMIN_EMAIL && email === ADMIN_EMAIL)
}

export async function assertAdmin(): Promise<{ user: { id: string; email?: string }, isSuperAdmin: boolean } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (isSuperAdminEmail(user.email)) return { user, isSuperAdmin: true }

  const admin = await createAdminClient()
  const { data: profile } = await admin
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) return { user, isSuperAdmin: false }
  return null
}

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminFeedbackClient from './AdminFeedbackClient'

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) redirect('/dashboard')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== adminEmail) redirect('/dashboard')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await service
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminFeedbackClient initialFeedback={data ?? []} />
}

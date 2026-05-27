import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'
import { redirect } from 'next/navigation'
import AdminMaintenanceClient from './AdminMaintenanceClient'

export const dynamic = 'force-dynamic'

export default async function AdminMaintenancePage() {
  const result = await assertAdmin()
  if (!result) redirect('/dashboard')

  const admin = await createAdminClient()
  const { data: settings } = await admin
    .from('app_settings')
    .select('maintenance_enabled, maintenance_until, maintenance_message')
    .eq('id', 1)
    .single()

  return (
    <AdminMaintenanceClient
      initialEnabled={settings?.maintenance_enabled ?? false}
      initialUntil={settings?.maintenance_until ?? null}
      initialMessage={settings?.maintenance_message ?? 'Wartungsarbeiten'}
    />
  )
}

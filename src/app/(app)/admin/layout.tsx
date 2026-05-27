import { assertAdmin } from '@/lib/auth/admin'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await assertAdmin()
  if (!result) redirect('/dashboard')
  return <>{children}</>
}

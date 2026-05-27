import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin, isSuperAdminEmail } from '@/lib/auth/admin'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

export async function PATCH(request: Request) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!result.isSuperAdmin) return NextResponse.json({ error: 'Nur der Super-Admin kann Admins ernennen' }, { status: 403 })

  const { userId, promote } = await request.json() as { userId: string; promote: boolean }
  if (!userId || typeof promote !== 'boolean') {
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Protect the super-admin account from being demoted
  const { data: targetUser } = await admin.auth.admin.getUserById(userId)
  if (isSuperAdminEmail(targetUser?.user?.email)) {
    return NextResponse.json({ error: 'Super-Admin kann nicht geändert werden' }, { status: 403 })
  }

  const { error } = await admin
    .from('user_profiles')
    .update({ is_admin: promote })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

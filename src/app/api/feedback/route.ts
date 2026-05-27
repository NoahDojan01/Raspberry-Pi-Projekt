import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// POST /api/feedback – submit new feedback
export async function POST(req: NextRequest) {
  const { message, name } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Nachricht darf nicht leer sein' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Use admin client to bypass RLS for the insert
  const admin = await createAdminClient()
  const { error } = await admin.from('feedback').insert({
    user_id: user?.id ?? null,
    name: name?.trim() || null,
    message: message.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// GET /api/feedback – admin only: list all feedback
export async function GET(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return NextResponse.json({ error: 'Nicht konfiguriert' }, { status: 403 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
  }

  // Use service role to bypass RLS for reads
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await service
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data })
}

// PATCH /api/feedback – toggle resolved
export async function PATCH(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return NextResponse.json({ error: 'Nicht konfiguriert' }, { status: 403 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
  }

  const { id, resolved } = await req.json()
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { error } = await service.from('feedback').update({ resolved }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GROUP_ID_REGEX = /^[A-Za-z0-9]{8}$/

async function checkMigration(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { error } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', userId)
    .single()

  if (error?.message?.toLowerCase().includes('column')) {
    return false
  }
  return true
}

const MIGRATION_ERROR = NextResponse.json(
  {
    error: 'migration_needed',
    message: 'Die Gruppen-Spalten fehlen noch in der Datenbank. Bitte führe die Migration aus.',
    sql: `ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS group_ids text[] DEFAULT '{}';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS group_names jsonb DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_user_profiles_group_ids ON public.user_profiles USING GIN(group_ids);`,
  },
  { status: 503 }
)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  if (error?.message?.toLowerCase().includes('column')) return MIGRATION_ERROR

  const ids: string[] = profile?.group_ids ?? []
  const names: Record<string, string> = profile?.group_names ?? {}

  const groups = ids.map((id) => ({ id, name: names[id] ?? id }))
  return NextResponse.json({ groups })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { groupId, name } = await request.json()
  const id = (groupId ?? '').trim().toUpperCase()

  if (!GROUP_ID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Gruppen-ID muss genau 8 Buchstaben oder Zahlen sein' }, { status: 400 })
  }
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Bitte gib einen Gruppennamen ein' }, { status: 400 })
  }

  const { data: profile, error: readError } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  if (readError?.message?.toLowerCase().includes('column')) return MIGRATION_ERROR

  const currentIds: string[] = profile?.group_ids ?? []
  const currentNames: Record<string, string> = profile?.group_names ?? {}

  if (currentIds.includes(id)) {
    return NextResponse.json({ error: 'Du bist dieser Gruppe bereits beigetreten' }, { status: 400 })
  }
  if (currentIds.length >= 5) {
    return NextResponse.json({ error: 'Maximal 5 Gruppen möglich' }, { status: 400 })
  }

  const newIds = [...currentIds, id]
  const newNames: Record<string, string> = { ...currentNames, [id]: name.trim() }

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ group_ids: newIds, group_names: newNames })
    .eq('id', user.id)

  if (updateError) {
    console.error('Group update error:', updateError)
    if (updateError.message?.toLowerCase().includes('column')) return MIGRATION_ERROR
    return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
  }

  return NextResponse.json({
    groups: newIds.map((gid) => ({ id: gid, name: newNames[gid] ?? gid })),
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { groupId, name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name darf nicht leer sein' }, { status: 400 })

  const { data: profile, error: readError } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  if (readError?.message?.toLowerCase().includes('column')) return MIGRATION_ERROR

  const ids: string[] = profile?.group_ids ?? []
  const names: Record<string, string> = { ...(profile?.group_names ?? {}), [groupId]: name.trim() }

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ group_names: names })
    .eq('id', user.id)

  if (updateError) {
    console.error('Group rename error:', updateError)
    if (updateError.message?.toLowerCase().includes('column')) return MIGRATION_ERROR
    return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
  }

  return NextResponse.json({ groups: ids.map((id) => ({ id, name: names[id] ?? id })) })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { groupId } = await request.json()

  const { data: profile, error: readError } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  if (readError?.message?.toLowerCase().includes('column')) return MIGRATION_ERROR

  const newIds = (profile?.group_ids ?? []).filter((g: string) => g !== groupId)
  const newNames = { ...(profile?.group_names ?? {}) }
  delete newNames[groupId]

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ group_ids: newIds, group_names: newNames })
    .eq('id', user.id)

  if (updateError) {
    console.error('Group delete error:', updateError)
    if (updateError.message?.toLowerCase().includes('column')) return MIGRATION_ERROR
    return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
  }

  return NextResponse.json({ groups: newIds.map((id: string) => ({ id, name: newNames[id] ?? id })) })
}

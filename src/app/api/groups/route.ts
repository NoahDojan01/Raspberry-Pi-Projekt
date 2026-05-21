import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GROUP_ID_REGEX = /^[A-Za-z0-9]{8}$/

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

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

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

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

  await supabase
    .from('user_profiles')
    .update({ group_ids: newIds, group_names: newNames })
    .eq('id', user.id)

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

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  const ids: string[] = profile?.group_ids ?? []
  const names: Record<string, string> = { ...(profile?.group_names ?? {}), [groupId]: name.trim() }

  await supabase.from('user_profiles').update({ group_names: names }).eq('id', user.id)

  return NextResponse.json({ groups: ids.map((id) => ({ id, name: names[id] ?? id })) })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { groupId } = await request.json()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  const newIds = (profile?.group_ids ?? []).filter((g: string) => g !== groupId)
  const newNames = { ...(profile?.group_names ?? {}) }
  delete newNames[groupId]

  await supabase.from('user_profiles').update({ group_ids: newIds, group_names: newNames }).eq('id', user.id)

  return NextResponse.json({ groups: newIds.map((id: string) => ({ id, name: newNames[id] ?? id })) })
}

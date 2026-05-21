import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GROUP_ID_REGEX = /^[A-Za-z0-9]{8}$/

const PROFILE_MIGRATION_SQL = `ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS group_ids text[] DEFAULT '{}';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS group_names jsonb DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_user_profiles_group_ids ON public.user_profiles USING GIN(group_ids);`

const GROUPS_TABLE_SQL = `-- Gemeinsame Gruppen-Tabelle (geräteübergreifend geteilte Namen)
CREATE TABLE IF NOT EXISTS public.groups (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_select" ON public.groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "groups_insert" ON public.groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_update" ON public.groups
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`

function isGroupsTableMissing(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('relation') || msg.includes('does not exist')
}

const PROFILE_MIGRATION_ERROR = NextResponse.json(
  { error: 'migration_needed', sql: PROFILE_MIGRATION_SQL },
  { status: 503 }
)

function groupsTableMissingError() {
  return NextResponse.json(
    { error: 'groups_table_missing', sql: GROUPS_TABLE_SQL },
    { status: 503 }
  )
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  if (profileError?.message?.toLowerCase().includes('column')) return PROFILE_MIGRATION_ERROR

  const ids: string[] = profile?.group_ids ?? []
  const localNames: Record<string, string> = profile?.group_names ?? {}

  if (ids.length === 0) return NextResponse.json({ groups: [] })

  const { data: globalGroups, error: groupsError } = await supabase
    .from('groups')
    .select('id, name')
    .in('id', ids)

  if (isGroupsTableMissing(groupsError)) {
    return NextResponse.json({
      groups: ids.map(id => ({ id, name: localNames[id] ?? id })),
      needsGroupsTableMigration: true,
      sql: GROUPS_TABLE_SQL,
    })
  }

  if (groupsError) {
    console.error('Error fetching groups:', groupsError)
    return NextResponse.json({ error: 'Fehler beim Laden der Gruppen' }, { status: 500 })
  }

  const globalNameMap = Object.fromEntries((globalGroups ?? []).map(g => [g.id, g.name]))
  const groups = ids.map(id => ({ id, name: globalNameMap[id] ?? localNames[id] ?? id }))
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

  const { data: profile, error: readError } = await supabase
    .from('user_profiles')
    .select('group_ids, group_names')
    .eq('id', user.id)
    .single()

  if (readError?.message?.toLowerCase().includes('column')) return PROFILE_MIGRATION_ERROR

  const currentIds: string[] = profile?.group_ids ?? []
  if (currentIds.includes(id)) {
    return NextResponse.json({ error: 'Du bist dieser Gruppe bereits beigetreten' }, { status: 400 })
  }
  if (currentIds.length >= 5) {
    return NextResponse.json({ error: 'Maximal 5 Gruppen möglich' }, { status: 400 })
  }

  // Look up group in shared table
  const { data: existingGroup, error: lookupError } = await supabase
    .from('groups')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (isGroupsTableMissing(lookupError)) return groupsTableMissingError()
  if (lookupError) {
    console.error('Group lookup error:', lookupError)
    return NextResponse.json({ error: 'Fehler beim Suchen der Gruppe' }, { status: 500 })
  }

  let groupName: string

  if (existingGroup) {
    // Group already exists – join with its shared canonical name
    groupName = existingGroup.name
  } else {
    // New group – caller must provide a name
    if (!name?.trim()) {
      return NextResponse.json({ needsName: true }, { status: 200 })
    }
    groupName = name.trim()

    const { error: createError } = await supabase
      .from('groups')
      .insert({ id, name: groupName, created_by: user.id })

    if (createError) {
      if (createError.code === '23505') {
        // Race condition: another user just created it – use their name
        const { data: raceGroup } = await supabase.from('groups').select('name').eq('id', id).single()
        groupName = raceGroup?.name ?? groupName
      } else {
        console.error('Group create error:', createError)
        return NextResponse.json({ error: 'Konnte Gruppe nicht erstellen' }, { status: 500 })
      }
    }
  }

  const newIds = [...currentIds, id]
  const localNames: Record<string, string> = { ...(profile?.group_names ?? {}), [id]: groupName }

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ group_ids: newIds, group_names: localNames })
    .eq('id', user.id)

  if (updateError) {
    console.error('Profile update error:', updateError)
    if (updateError.message?.toLowerCase().includes('column')) return PROFILE_MIGRATION_ERROR
    return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
  }

  const { data: allGlobal } = await supabase.from('groups').select('id, name').in('id', newIds)
  const globalMap = Object.fromEntries((allGlobal ?? []).map(g => [g.id, g.name]))

  return NextResponse.json({
    groups: newIds.map(gid => ({ id: gid, name: globalMap[gid] ?? localNames[gid] ?? gid })),
    joinedName: groupName,
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

  if (readError?.message?.toLowerCase().includes('column')) return PROFILE_MIGRATION_ERROR

  const ids: string[] = profile?.group_ids ?? []
  if (!ids.includes(groupId)) {
    return NextResponse.json({ error: 'Du bist dieser Gruppe nicht beigetreten' }, { status: 403 })
  }

  const { data: existingGroup, error: lookupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .maybeSingle()

  if (isGroupsTableMissing(lookupError)) return groupsTableMissingError()

  if (existingGroup) {
    const { error: updateError } = await supabase
      .from('groups')
      .update({ name: name.trim() })
      .eq('id', groupId)

    if (updateError) {
      console.error('Group rename error:', updateError)
      return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
    }
  } else {
    // Group not in shared table yet – create it now
    const { error: insertError } = await supabase
      .from('groups')
      .insert({ id: groupId, name: name.trim(), created_by: user.id })

    if (insertError && insertError.code !== '23505') {
      return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
    }
  }

  // Keep local copy in sync
  const localNames: Record<string, string> = { ...(profile?.group_names ?? {}), [groupId]: name.trim() }
  await supabase.from('user_profiles').update({ group_names: localNames }).eq('id', user.id)

  const { data: allGlobal } = await supabase.from('groups').select('id, name').in('id', ids)
  const globalMap = Object.fromEntries((allGlobal ?? []).map(g => [g.id, g.name]))
  return NextResponse.json({ groups: ids.map(id => ({ id, name: globalMap[id] ?? localNames[id] ?? id })) })
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

  if (readError?.message?.toLowerCase().includes('column')) return PROFILE_MIGRATION_ERROR

  const newIds = (profile?.group_ids ?? []).filter((g: string) => g !== groupId)
  const newNames = { ...(profile?.group_names ?? {}) }
  delete newNames[groupId]

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ group_ids: newIds, group_names: newNames })
    .eq('id', user.id)

  if (updateError) {
    console.error('Group delete error:', updateError)
    if (updateError.message?.toLowerCase().includes('column')) return PROFILE_MIGRATION_ERROR
    return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
  }

  if (newIds.length === 0) return NextResponse.json({ groups: [] })

  const { data: allGlobal } = await supabase.from('groups').select('id, name').in('id', newIds)
  const globalMap = Object.fromEntries((allGlobal ?? []).map(g => [g.id, g.name]))
  return NextResponse.json({ groups: newIds.map((id: string) => ({ id, name: globalMap[id] ?? newNames[id] ?? id })) })
}

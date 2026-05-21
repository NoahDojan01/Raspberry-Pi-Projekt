import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ResultsClient from './ResultsClient'

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('test_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  const { data: sessionAnswers } = await supabase
    .from('test_answers')
    .select('*')
    .eq('session_id', id)
    .order('created_at')

  return <ResultsClient session={session} answers={sessionAnswers || []} />
}

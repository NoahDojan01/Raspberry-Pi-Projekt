import { createAdminClient } from '@/lib/supabase/server'
import AdminQuestionsClient from './AdminQuestionsClient'
import { QUESTIONS } from '@/data/questions'

export const dynamic = 'force-dynamic'

export default async function AdminQuestionsPage() {
  const admin = await createAdminClient()

  const { data: hidden } = await admin
    .from('hidden_questions')
    .select('question_id')

  const hiddenIds = new Set((hidden ?? []).map(h => h.question_id as number))

  const questions = QUESTIONS.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    answer: q.answer,
    difficulty: q.difficulty,
    points: q.points,
    hidden: hiddenIds.has(q.id),
  }))

  return <AdminQuestionsClient questions={questions} />
}

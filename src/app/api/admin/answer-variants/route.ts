import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function POST(request: Request) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { questionId, variantText } = await request.json()
  if (!questionId || !variantText?.trim()) {
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const trimmed = variantText.trim()

  const { error } = await admin.from('approved_answer_variants').insert({
    question_id: questionId,
    variant_text: trimmed,
    dispute_id: null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Retroactively update past test answers that match this variant
  const { data: matchingAnswers } = await admin
    .from('test_answers')
    .select('id, session_id, max_score')
    .eq('question_id', questionId)
    .eq('user_answer', trimmed)
    .lt('percentage', 100)

  if (matchingAnswers && matchingAnswers.length > 0) {
    await admin
      .from('test_answers')
      .update({ score: 1, percentage: 100, feedback: 'Alternative Antwort – als korrekt gewertet.' })
      .in('id', matchingAnswers.map(a => a.id))

    const affectedSessionIds = [...new Set(matchingAnswers.map(a => a.session_id))]

    await Promise.all(affectedSessionIds.map(async (sessionId) => {
      const { data: allAnswers } = await admin
        .from('test_answers')
        .select('score, max_score')
        .eq('session_id', sessionId)
      if (!allAnswers) return
      const newTotalScore = allAnswers.reduce((sum, a) => sum + (a.score as number) * (a.max_score as number), 0)
      const sessionMaxScore = allAnswers.reduce((sum, a) => sum + (a.max_score as number), 0)
      const newPercentage = sessionMaxScore > 0 ? (newTotalScore / sessionMaxScore) * 100 : 0
      await admin.from('test_sessions')
        .update({ total_score: newTotalScore, percentage: newPercentage })
        .eq('id', sessionId)
    }))
  }

  return NextResponse.json({ ok: true })
}

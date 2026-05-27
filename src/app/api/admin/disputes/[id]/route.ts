import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { assertAdmin } from '@/lib/auth/admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await assertAdmin()
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { action } = await request.json() as { action: 'approve' | 'reject' }

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: dispute } = await admin
    .from('answer_disputes')
    .select('question_id, user_answer, user_id')
    .eq('id', id)
    .single()

  if (!dispute) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

  const { error: updateError } = await admin
    .from('answer_disputes')
    .update({ status: action === 'approve' ? 'approved' : 'rejected', resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  if (action === 'approve') {
    await admin.from('approved_answer_variants').insert({
      question_id: dispute.question_id,
      variant_text: dispute.user_answer,
      dispute_id: id,
    })

    const { data: userSessions } = await admin
      .from('test_sessions')
      .select('id')
      .eq('user_id', dispute.user_id)

    const sessionIds = userSessions?.map(s => s.id) ?? []

    if (sessionIds.length > 0) {
      const { data: matchingAnswers } = await admin
        .from('test_answers')
        .select('id, session_id, max_score')
        .in('session_id', sessionIds)
        .eq('question_id', dispute.question_id)
        .eq('user_answer', dispute.user_answer)
        .lt('percentage', 100)

      if (matchingAnswers && matchingAnswers.length > 0) {
        await admin
          .from('test_answers')
          .update({
            score: 1,
            percentage: 100,
            feedback: 'Einspruch genehmigt – Antwort als korrekt akzeptiert.',
          })
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

          await admin
            .from('test_sessions')
            .update({ total_score: newTotalScore, percentage: newPercentage })
            .eq('id', sessionId)
        }))
      }
    }
  }

  return NextResponse.json({ ok: true })
}

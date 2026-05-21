import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateLevel } from '@/lib/utils/helpers'
import type { UserAnswer } from '@/types'

interface SubmittedQuestion {
  id: number
  question: string
  answer: string
  difficulty: 'leicht' | 'mittel' | 'schwer'
  category: string
  points: number
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const body = await request.json()
  const { mode, questions, answers, totalScore, maxScore, percentage } = body as {
    mode: string
    questions: SubmittedQuestion[]
    answers: UserAnswer[]
    totalScore: number
    maxScore: number
    percentage: number
  }

  if (!mode || !questions?.length || !answers?.length) {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  // ── 1. Create session ──────────────────────────────────────────────────────
  const { data: session, error: sessionError } = await supabase
    .from('test_sessions')
    .insert({
      user_id: user.id,
      mode,
      total_score: totalScore,
      max_score: maxScore,
      percentage,
      questions_count: questions.length,
      xp_earned: 0,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (sessionError || !session) {
    console.error('Session insert error:', sessionError)
    return NextResponse.json({ error: 'Session konnte nicht gespeichert werden', detail: sessionError?.message }, { status: 500 })
  }

  // ── 2. Save answers ────────────────────────────────────────────────────────
  const answerRows = answers.map((answer, i) => {
    const q = questions[i]
    return {
      session_id: session.id,
      question_id: answer.questionId,
      question_text: q?.question ?? '',
      user_answer: answer.answer,
      expected_answer: q?.answer ?? '',
      score: answer.score,
      max_score: answer.maxScore,
      percentage: answer.percentage,
      feedback: answer.feedback ?? null,
      difficulty: q?.difficulty ?? 'mittel',
      category: q?.category ?? '',
    }
  })

  const { error: answersError } = await supabase.from('test_answers').insert(answerRows)
  if (answersError) {
    console.error('Answers insert error:', answersError)
    // non-fatal: session exists, continue
  }

  // ── 3. Calculate XP ───────────────────────────────────────────────────────
  const xpEarned = Math.round(percentage * 0.5 + questions.length * 2 + (mode === 'simulation' ? 20 : 10))

  await supabase
    .from('test_sessions')
    .update({ xp_earned: xpEarned })
    .eq('id', session.id)

  // ── 4. Update user stats (UPSERT — works even if row doesn't exist yet) ───
  const { data: currentStats } = await supabase
    .from('user_stats')
    .select('xp, level, streak, last_activity_date, total_tests, average_score, best_score, total_questions_answered')
    .eq('user_id', user.id)
    .single()

  const prevXP = currentStats?.xp ?? 0
  const prevTotal = currentStats?.total_tests ?? 0
  const prevAvg = currentStats?.average_score ?? 0
  const prevBest = currentStats?.best_score ?? 0
  const prevAnswered = currentStats?.total_questions_answered ?? 0
  const prevStreak = currentStats?.streak ?? 0
  const lastDate = currentStats?.last_activity_date ?? null

  const newXP = prevXP + xpEarned
  const newLevel = calculateLevel(newXP)
  const newTotal = prevTotal + 1
  const newAvg = prevTotal === 0 ? percentage : (prevAvg * prevTotal + percentage) / newTotal
  const newBest = Math.max(prevBest, percentage)
  const newAnswered = prevAnswered + questions.length

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const newStreak = lastDate === yesterday || lastDate === today
    ? prevStreak + (lastDate === today ? 0 : 1)
    : 1

  const { error: statsError } = await supabase
    .from('user_stats')
    .upsert(
      {
        user_id: user.id,
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        last_activity_date: today,
        total_tests: newTotal,
        average_score: newAvg,
        best_score: newBest,
        total_questions_answered: newAnswered,
      },
      { onConflict: 'user_id' }
    )

  if (statsError) {
    console.error('Stats upsert error:', statsError)
    // non-fatal: return the session so user can see results, but log the error
  }

  // ── 5. Ensure user_profiles row exists ────────────────────────────────────
  await supabase
    .from('user_profiles')
    .upsert(
      {
        id: user.id,
        name: (user.user_metadata?.name as string | undefined)
          ?? user.email?.split('@')[0]
          ?? 'Nutzer',
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  return NextResponse.json({ sessionId: session.id, xpEarned })
}

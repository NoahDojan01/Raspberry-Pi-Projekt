import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { QUESTIONS } from '@/data/questions'
import { calculateXP, calculateLevel } from '@/lib/utils/helpers'
import type { UserAnswer } from '@/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { mode, questions, answers, totalScore, maxScore, percentage } = body

    // Create session
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
      return NextResponse.json({ error: 'Session konnte nicht gespeichert werden' }, { status: 500 })
    }

    // Save answers
    const answerRows = (answers as UserAnswer[]).map((answer, i) => {
      const q = questions[i]
      return {
        session_id: session.id,
        question_id: answer.questionId,
        question_text: q?.question || '',
        user_answer: answer.answer,
        expected_answer: q?.answer || '',
        score: answer.score,
        max_score: answer.maxScore,
        percentage: answer.percentage,
        feedback: answer.feedback,
        difficulty: q?.difficulty || 'mittel',
        category: q?.category || '',
      }
    })

    await supabase.from('test_answers').insert(answerRows)

    // Calculate XP
    const xpEarned = Math.round(percentage * 0.5 + questions.length * 2 + (mode === 'simulation' ? 20 : 10))

    await supabase
      .from('test_sessions')
      .update({ xp_earned: xpEarned })
      .eq('id', session.id)

    // Update user stats
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (currentStats) {
      const newXP = (currentStats.xp || 0) + xpEarned
      const newLevel = calculateLevel(newXP)
      const newTotal = (currentStats.total_tests || 0) + 1
      const newAvg = ((currentStats.average_score || 0) * (newTotal - 1) + percentage) / newTotal
      const newBest = Math.max(currentStats.best_score || 0, percentage)
      const newAnswered = (currentStats.total_questions_answered || 0) + questions.length

      // Streak logic
      const today = new Date().toISOString().split('T')[0]
      const lastDate = currentStats.last_activity_date
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const newStreak = lastDate === yesterday || lastDate === today
        ? (currentStats.streak || 0) + (lastDate === today ? 0 : 1)
        : 1

      await supabase
        .from('user_stats')
        .update({
          xp: newXP,
          level: newLevel,
          streak: newStreak,
          last_activity_date: today,
          total_tests: newTotal,
          average_score: newAvg,
          best_score: newBest,
          total_questions_answered: newAnswered,
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ sessionId: session.id, xpEarned })
  } catch (error) {
    console.error('Test submit error:', error)
    return NextResponse.json({ error: 'Intern Fehler' }, { status: 500 })
  }
}

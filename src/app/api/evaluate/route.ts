import { NextResponse } from 'next/server'
import { evaluateAnswer } from '@/lib/ai/evaluate'
import { QUESTIONS } from '@/data/questions'
import type { Question } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questionId, question, expectedAnswer, userAnswer, difficulty, requiresBrackets, requiresOrder, maxScore } = body

    if (!question || !expectedAnswer || !userAnswer) {
      return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
    }

    const questionObj: Question = QUESTIONS.find(q => q.id === questionId) || {
      id: questionId || 0,
      categoryNumber: 0,
      category: '',
      question,
      answer: expectedAnswer,
      difficulty: difficulty || 'mittel',
      points: maxScore || 2,
      requiresBrackets: requiresBrackets || false,
      requiresOrder: requiresOrder || false,
    }

    const result = await evaluateAnswer(questionObj, userAnswer)

    return NextResponse.json({
      score: result.score,
      percentage: result.percentage,
      feedback: result.feedback,
      isCorrect: result.isCorrect,
    })
  } catch (error) {
    console.error('Evaluate API error:', error)
    return NextResponse.json({ error: 'Bewertung fehlgeschlagen' }, { status: 500 })
  }
}

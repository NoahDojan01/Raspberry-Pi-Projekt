import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('pdf') as File | null

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Nur PDF-Dateien erlaubt' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Dynamic import to avoid server-component issues
    const pdfParse = (await import('pdf-parse')).default
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    const questions = parseQuestionsFromText(text)

    return NextResponse.json({ questions, total: questions.length })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Fehler beim Verarbeiten der PDF' }, { status: 500 })
  }
}

function parseQuestionsFromText(text: string) {
  const questions: Array<{
    number: number; question: string; answer: string;
    difficulty: string; category: string
  }> = []

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  let currentCategory = 'Allgemein'
  let currentQuestion: string | null = null
  let currentAnswerLines: string[] = []
  let questionNumber = 0
  let currentDifficulty = 'mittel'
  let inAnswer = false

  const categoryPattern = /^\d+\.\s+(.+)$/
  const questionPattern = /^(\d+)\.\s+(.+\?[!]?)$/
  const difficultyPattern = /^(leicht|mittel|schwer)$/i

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Category detection
    const catMatch = line.match(/^(?:\d+\.\s+)?(Glaubensbekenntnis|Lehre über|Die Heilige Schrift|Lehre von|Das geistliche|Das Gebet|Biblisches|Dienst|Wahre Anbetung|Satan|Gefahren|Gottes Heilsplan|Spezifisches)/)
    if (catMatch) {
      if (currentQuestion && currentAnswerLines.length > 0) {
        questions.push({
          number: questionNumber,
          question: currentQuestion,
          answer: currentAnswerLines.join(' ').replace(/^[-•]\s*/gm, '').trim(),
          difficulty: currentDifficulty,
          category: currentCategory,
        })
        currentQuestion = null
        currentAnswerLines = []
        inAnswer = false
      }
      currentCategory = line.replace(/^\d+\.\s+/, '')
      continue
    }

    // Question detection (number followed by text ending with ? or !)
    const qMatch = line.match(/^(\d+)\.\s+(.{10,}\?[!]?)$/)
    if (qMatch) {
      if (currentQuestion && currentAnswerLines.length > 0) {
        questions.push({
          number: questionNumber,
          question: currentQuestion,
          answer: currentAnswerLines.join('; ').replace(/^[-•]\s*/gm, '').trim(),
          difficulty: currentDifficulty,
          category: currentCategory,
        })
      }
      questionNumber = parseInt(qMatch[1])
      currentQuestion = qMatch[2]
      currentAnswerLines = []
      currentDifficulty = 'mittel'
      inAnswer = false
      continue
    }

    // Difficulty
    if (difficultyPattern.test(line)) {
      currentDifficulty = line.toLowerCase()
      inAnswer = true
      continue
    }

    // Answer lines (bullet points or continuation)
    if (currentQuestion && (inAnswer || line.startsWith('-') || line.startsWith('•'))) {
      const cleaned = line.replace(/^[-•]\s*/, '').trim()
      if (cleaned.length > 2) currentAnswerLines.push(cleaned)
    }
  }

  // Last question
  if (currentQuestion && currentAnswerLines.length > 0) {
    questions.push({
      number: questionNumber,
      question: currentQuestion,
      answer: currentAnswerLines.join('; ').trim(),
      difficulty: currentDifficulty,
      category: currentCategory,
    })
  }

  return questions.filter(q => q.question && q.answer)
}

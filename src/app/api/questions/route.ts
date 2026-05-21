import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const { data } = await supabase
      .from('questions')
      .select('*')
      .or(`user_id.eq.${user.id},is_default.eq.true`)
      .order('question_number')

    return NextResponse.json({ questions: data || [] })
  } catch {
    return NextResponse.json({ error: 'Fehler' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const { questions } = await request.json()

    const rows = questions.map((q: {
      number?: number; question: string; answer: string;
      difficulty?: string; category?: string
    }) => ({
      user_id: user.id,
      question_number: q.number || null,
      category: q.category || 'Importiert',
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty || 'mittel',
      points: q.difficulty === 'leicht' ? 1 : q.difficulty === 'schwer' ? 3 : 2,
      is_default: false,
    }))

    const { data, error } = await supabase.from('questions').insert(rows).select()
    if (error) throw error

    return NextResponse.json({ questions: data, count: data?.length })
  } catch (error) {
    return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  }
}

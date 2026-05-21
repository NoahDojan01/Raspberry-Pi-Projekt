import Anthropic from '@anthropic-ai/sdk'
import type { EvaluationResult, Question } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function evaluateAnswer(
  question: Question,
  userAnswer: string
): Promise<EvaluationResult> {
  const trimmedAnswer = userAnswer.trim()

  if (!trimmedAnswer) {
    return { score: 0, percentage: 0, feedback: 'Keine Antwort eingegeben.', isCorrect: false }
  }

  const specialRules = buildSpecialRules(question)

  const prompt = `Du bist ein Prüfer für eine religiöse Lehrprüfung. Bewerte die Antwort des Schülers.

**Frage:** ${question.question}

**Erwartete Antwort (Musterlösung):**
${question.answer}

**Antwort des Schülers:**
${trimmedAnswer}

**Bewertungsregeln:**
1. Kleine Rechtschreibfehler = volle Punktzahl (z.B. "Antiocha" statt "Antiochia")
2. Ähnliche Formulierungen = volle oder teilweise Punktzahl
3. Sinngemäß richtige Antworten = Punkte geben
4. Bei Aufzählungen: Prüfe ob die geforderte Mindestanzahl vorhanden ist
5. Bei Zitaten (Psalmen): Sinngemäß richtig und vollständig reicht, wörtlich perfekt = Bonus
6. Gib konstruktives, motivierendes Feedback auf Deutsch
${specialRules}

Antworte NUR mit einem JSON-Objekt in diesem Format:
{
  "score": <Zahl zwischen 0.0 und 1.0>,
  "feedback": "<kurzes, motivierendes Feedback auf Deutsch (max 2 Sätze)>"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return fallbackEvaluation(question, trimmedAnswer)
    }

    const result = JSON.parse(jsonMatch[0])
    const score = Math.max(0, Math.min(1, Number(result.score) || 0))

    return {
      score,
      percentage: Math.round(score * 100),
      feedback: result.feedback || 'Bewertung abgeschlossen.',
      isCorrect: score >= 0.7,
    }
  } catch (error) {
    console.error('AI evaluation error:', error)
    return fallbackEvaluation(question, trimmedAnswer)
  }
}

function buildSpecialRules(question: Question): string {
  const rules: string[] = []
  let ruleNum = 7

  // Detect "mindestens X" / "mind. X" in question text
  const minMatch = question.question.match(/mind(?:estens)?\.?\s*(\d+)/i)
  if (minMatch) {
    const minCount = minMatch[1]
    rules.push(
      `${ruleNum++}. MINDESTANZAHL: Die Frage verlangt MINDESTENS ${minCount} Beispiel(e)/Antwort(en). Gibt der Schüler genau ${minCount} korrekte Antworten, ist das 100% richtig. Mehr als ${minCount} Antworten sind kein Bonus, weniger als ${minCount} sind Punktabzug.`
    )
  }

  if (question.id === 28) {
    rules.push(
      `${ruleNum++}. SONDERREGEL: Bei dieser Frage (Natur-Analogie) MÜSSEN die Inhalte in Klammern ebenfalls genannt werden. Fehlen sie, ziehe Punkte ab.`
    )
  }

  if (question.id === 80) {
    rules.push(
      `${ruleNum++}. SONDERREGEL: Die Zehn Gebote MÜSSEN in exakt richtiger Reihenfolge (1-10) aufgezählt werden. Falsche Reihenfolge = Teilpunkte nach Anteil richtiger Positionen.`
    )
  }

  return rules.join('\n')
}

function fallbackEvaluation(question: Question, userAnswer: string): EvaluationResult {
  const expected = question.answer.toLowerCase()
  const user = userAnswer.toLowerCase()

  const expectedWords = expected
    .split(/[;,\s]+/)
    .filter((w) => w.length > 3)
    .map((w) => w.replace(/[^a-züäöß]/g, ''))

  if (!expectedWords.length) {
    return { score: 0.5, percentage: 50, feedback: 'Antwort erhalten.', isCorrect: true }
  }

  let matches = 0
  for (const word of expectedWords) {
    if (user.includes(word)) matches++
  }

  const score = Math.min(1, matches / Math.max(expectedWords.length * 0.6, 1))

  return {
    score,
    percentage: Math.round(score * 100),
    feedback:
      score >= 0.7
        ? 'Gute Antwort! Weiter so.'
        : score >= 0.4
          ? 'Teilweise richtig. Schau dir die vollständige Antwort noch einmal an.'
          : 'Leider nicht ausreichend. Lerne diese Antwort noch einmal.',
    isCorrect: score >= 0.7,
  }
}

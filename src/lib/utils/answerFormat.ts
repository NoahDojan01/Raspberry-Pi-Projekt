const GERMAN_NUMBERS: Record<string, number> = {
  ein: 1, eine: 1, eins: 1, einen: 1,
  zwei: 2, drei: 3, vier: 4, fünf: 5,
  sechs: 6, sieben: 7, acht: 8, neun: 9,
  zehn: 10, elf: 11, zwölf: 12,
}

function parseNumber(word: string): number | null {
  const n = parseInt(word)
  if (!isNaN(n)) return n
  return GERMAN_NUMBERS[word.toLowerCase()] ?? null
}

/**
 * Returns the minimum item count a question requires, or null if not applicable.
 * Handles "mindestens X", "Nenne X", "Zähle X" with both digits and German words.
 */
export function extractCountFromQuestion(question: string): number | null {
  // "mindestens X" takes priority
  const minMatch = question.match(/mind(?:estens)?\.?\s+(\w+)/i)
  if (minMatch) {
    const n = parseNumber(minMatch[1])
    if (n !== null && n >= 2) return n
  }

  // "Nenne X" / "Zähle X" with a concrete number
  const nenneMatch = question.match(/(?:nenne|nenn|zähle?|zähl)\s+(\w+)/i)
  if (nenneMatch) {
    const n = parseNumber(nenneMatch[1])
    if (n !== null && n >= 2 && n <= 15) return n
  }

  return null
}

/**
 * Returns a numbered template ("1. \n2. \n…") for questions that ask for N items,
 * or an empty string when no template is needed.
 */
export function getAnswerTemplate(question: string): string {
  const count = extractCountFromQuestion(question)
  if (!count) return ''
  return Array.from({ length: count }, (_, i) => `${i + 1}. `).join('\n')
}

/**
 * Parses an answer string into a display structure.
 * – Numbered: parts match "1. text", "2. text", … sequentially (space after dot required)
 * – Bullets:  multiple semicolon-separated parts
 * – Plain:    single sentence, no separators
 */
export function parseAnswerDisplay(answer: string): {
  type: 'numbered' | 'bullets' | 'plain'
  parts: string[]
} {
  const rawParts = answer.split(/;\s*/).map(p => p.trim()).filter(p => p.length > 0)

  if (rawParts.length <= 1) {
    return { type: 'plain', parts: [answer.trim()] }
  }

  // Numbered: every part matches its 1-based index "N. " (space after dot)
  const isNumbered = rawParts.every((p, i) => new RegExp(`^${i + 1}\\.\\s`).test(p))
  if (isNumbered) {
    return {
      type: 'numbered',
      parts: rawParts.map(p => p.replace(/^\d+\.\s*/, '')),
    }
  }

  return { type: 'bullets', parts: rawParts }
}

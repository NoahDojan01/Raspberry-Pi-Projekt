'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Eye, EyeOff, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/helpers'

interface AdminQuestion {
  id: number
  category: string
  question: string
  answer: string
  difficulty: string
  points: number
  hidden: boolean
}

const DIFF_COLORS: Record<string, string> = {
  leicht: 'text-emerald-400 bg-emerald-400/10',
  mittel: 'text-accent bg-accent/10',
  schwer: 'text-rose-400 bg-rose-400/10',
}

export default function AdminQuestionsClient({ questions: initial }: { questions: AdminQuestion[] }) {
  const [questions, setQuestions] = useState(initial)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterHidden, setFilterHidden] = useState<'all' | 'visible' | 'hidden'>('all')
  const [toggling, setToggling] = useState<number | null>(null)

  const categories = useMemo(() => [...new Set(questions.map(q => q.category))], [questions])

  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (filterCategory && q.category !== filterCategory) return false
      if (filterHidden === 'visible' && q.hidden) return false
      if (filterHidden === 'hidden' && !q.hidden) return false
      if (search) {
        const s = search.toLowerCase()
        return q.question.toLowerCase().includes(s) || q.answer.toLowerCase().includes(s)
      }
      return true
    })
  }, [questions, search, filterCategory, filterHidden])

  const hiddenCount = questions.filter(q => q.hidden).length

  async function toggleHidden(id: number, currentHidden: boolean) {
    setToggling(id)
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, hidden: !currentHidden }),
      })
      if (!res.ok) throw new Error()
      setQuestions(qs => qs.map(q => q.id === id ? { ...q, hidden: !currentHidden } : q))
      toast.success(currentHidden ? 'Frage wieder sichtbar' : 'Frage versteckt')
    } catch {
      toast.error('Fehler')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
          <HelpCircle size={18} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Fragen</h1>
          <p className="text-ui/40 text-sm">{questions.length} Fragen · {hiddenCount} versteckt</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ui/30" />
          <input
            type="text"
            placeholder="Suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 glass rounded-xl border border-ui/8 text-sm bg-transparent placeholder:text-ui/30 focus:outline-none focus:border-accent/30"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 glass rounded-xl border border-ui/8 text-sm bg-transparent text-ui/70 focus:outline-none focus:border-accent/30"
        >
          <option value="">Alle Kategorien</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex rounded-xl overflow-hidden border border-ui/8 glass text-sm">
          {(['all', 'visible', 'hidden'] as const).map(v => (
            <button
              key={v}
              onClick={() => setFilterHidden(v)}
              className={cn(
                'px-3 py-2.5 transition-colors',
                filterHidden === v ? 'bg-accent/15 text-accent' : 'text-ui/60 hover:text-ui/85'
              )}
            >
              {v === 'all' ? 'Alle' : v === 'visible' ? 'Sichtbar' : 'Versteckt'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-ui/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ui/5">
                <th className="text-left px-4 py-3 text-ui/40 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-ui/40 font-medium">Kategorie</th>
                <th className="text-left px-4 py-3 text-ui/40 font-medium">Frage</th>
                <th className="text-left px-4 py-3 text-ui/40 font-medium">Schwierigkeit</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id} className={cn('border-b border-ui/5 last:border-0 transition-colors', q.hidden ? 'opacity-40' : 'hover:bg-ui/2')}>
                  <td className="px-4 py-3 text-ui/40 font-mono text-xs">{q.id}</td>
                  <td className="px-4 py-3 text-ui/60 text-xs whitespace-nowrap max-w-[120px] truncate">{q.category}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="truncate">{q.question}</div>
                    <div className="text-xs text-ui/35 truncate mt-0.5">{q.answer}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', DIFF_COLORS[q.difficulty] ?? 'text-ui/40 bg-ui/8')}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleHidden(q.id, q.hidden)}
                      disabled={toggling === q.id}
                      className={cn(
                        'p-1.5 rounded-lg transition-all',
                        q.hidden
                          ? 'text-accent hover:bg-accent/10'
                          : 'text-ui/25 hover:text-ui/60 hover:bg-ui/5'
                      )}
                      title={q.hidden ? 'Einblenden' : 'Verstecken'}
                    >
                      {q.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-ui/30 text-sm">Keine Fragen gefunden</div>
          )}
        </div>
      </div>
    </div>
  )
}

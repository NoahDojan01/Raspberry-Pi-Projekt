'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library, ChevronLeft, ChevronRight, Eye, EyeOff,
  Filter, Search, Shuffle, CheckCircle, RotateCcw, Lightbulb
} from 'lucide-react'
import { QUESTIONS, CATEGORIES } from '@/data/questions'
import { getDifficultyColor, getDifficultyLabel, cn } from '@/lib/utils/helpers'
import type { Question, Difficulty } from '@/types'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function KatalogPage() {
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'alle'>('alle')
  const [filterCategory, setFilterCategory] = useState<number | 'alle'>('alle')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [markedLearned, setMarkedLearned] = useState<Set<number>>(new Set())

  const filtered = questions.filter((q) => {
    if (filterDifficulty !== 'alle' && q.difficulty !== filterDifficulty) return false
    if (filterCategory !== 'alle' && q.categoryNumber !== filterCategory) return false
    if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const current = filtered[currentIndex]
  const progress = filtered.length > 0 ? ((currentIndex + 1) / filtered.length) * 100 : 0

  const goNext = useCallback(() => {
    setShowAnswer(false)
    setCurrentIndex((i) => Math.min(i + 1, filtered.length - 1))
  }, [filtered.length])

  const goPrev = useCallback(() => {
    setShowAnswer(false)
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  const handleShuffle = () => {
    setQuestions(shuffleArray(QUESTIONS))
    setCurrentIndex(0)
    setShowAnswer(false)
  }

  const handleReset = () => {
    setQuestions(QUESTIONS)
    setCurrentIndex(0)
    setShowAnswer(false)
    setFilterDifficulty('alle')
    setFilterCategory('alle')
    setSearchQuery('')
  }

  const toggleLearned = () => {
    if (!current) return
    setMarkedLearned((prev) => {
      const next = new Set(prev)
      if (next.has(current.id)) next.delete(current.id)
      else next.add(current.id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Library className="text-violet-400" />
            Fragenkatalog
          </h1>
          <p className="text-white/50 mt-1">
            {filtered.length} von {QUESTIONS.length} Fragen · {markedLearned.size} als gelernt markiert
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-3 py-2 glass rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition-all hover:-translate-y-0.5"
          >
            <Shuffle size={16} />
            Mischen
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all hover:-translate-y-0.5',
              showFilters
                ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                : 'glass border-white/10 text-white/60 hover:text-white'
            )}
          >
            <Filter size={16} />
            Filter
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 glass rounded-xl border border-white/10 text-sm text-white/60 hover:text-white transition-all hover:-translate-y-0.5"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4 border border-white/10 space-y-4"
          >
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0) }}
                placeholder="Fragen durchsuchen..."
                className="w-full pl-9 pr-4 py-2.5 glass rounded-xl border border-white/10 text-sm text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-wrap gap-2">
                {(['alle', 'leicht', 'mittel', 'schwer'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => { setFilterDifficulty(d); setCurrentIndex(0) }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      filterDifficulty === d
                        ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                        : 'glass border-white/10 text-white/50 hover:text-white/80'
                    )}
                  >
                    {d === 'alle' ? 'Alle' : getDifficultyLabel(d)}
                  </button>
                ))}
              </div>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value === 'alle' ? 'alle' : Number(e.target.value)); setCurrentIndex(0) }}
                className="px-3 py-1.5 glass rounded-lg border border-white/10 text-xs text-white/70 focus:border-violet-500/50 focus:outline-none bg-transparent"
              >
                <option value="alle" className="bg-slate-900">Alle Kategorien</option>
                {CATEGORIES.map((c) => (
                  <option key={c.number} value={c.number} className="bg-slate-900">
                    {c.number}. {c.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-white/40 mb-2">
          <span>Fortschritt</span>
          <span>{currentIndex + 1} / {filtered.length}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-white/5 text-center text-white/30">
          <Search size={40} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">Keine Fragen gefunden</p>
          <p className="text-sm mt-1">Versuche andere Filter oder Suchbegriffe</p>
        </div>
      ) : current ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="glass-strong rounded-3xl p-8 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', getDifficultyColor(current.difficulty))}>
                  {getDifficultyLabel(current.difficulty)} · {current.points} {current.points === 1 ? 'Punkt' : 'Punkte'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs border border-white/10 text-white/50 glass">
                  {current.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs border border-white/10 text-white/40 glass ml-auto">
                  Frage {current.id}
                </span>
                {markedLearned.has(current.id) && (
                  <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Gelernt
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold leading-relaxed mb-6 relative z-10">
                {current.question}
              </h2>

              {(current.requiresBrackets || current.requiresOrder) && (
                <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">{current.hint}</p>
                </div>
              )}

              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="glass rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Musterlösung</span>
                      </div>
                      <div className="text-white/90 leading-relaxed text-sm">
                        {current.answer.split('; ').map((part, i) => (
                          <div key={i} className="flex gap-2 mb-1">
                            <span className="text-emerald-400/60 shrink-0">•</span>
                            <span>{part}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={() => setShowAnswer(!showAnswer)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
                    showAnswer
                      ? 'bg-white/10 text-white/70 border border-white/10'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                  )}
                >
                  {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showAnswer ? 'Antwort ausblenden' : 'Antwort anzeigen'}
                </motion.button>

                <button
                  onClick={toggleLearned}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all',
                    markedLearned.has(current.id)
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'glass border-white/10 text-white/50 hover:text-white'
                  )}
                >
                  <CheckCircle size={16} />
                  {markedLearned.has(current.id) ? 'Gelernt ✓' : 'Als gelernt markieren'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 glass rounded-xl border border-white/10 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-violet-500/30 hover:-translate-y-0.5"
            >
              <ChevronLeft size={18} />
              Zurück
            </button>

            <div className="hidden sm:flex items-center gap-1.5">
              {filtered.slice(Math.max(0, currentIndex - 4), currentIndex + 5).map((_, i) => {
                const idx = Math.max(0, currentIndex - 4) + i
                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setShowAnswer(false) }}
                    className={cn(
                      'transition-all rounded-full',
                      idx === currentIndex ? 'w-6 h-2 bg-violet-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                    )}
                  />
                )
              })}
            </div>

            <button
              onClick={goNext}
              disabled={currentIndex === filtered.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:from-violet-500 hover:to-purple-500 hover:-translate-y-0.5 shadow-lg shadow-violet-500/20"
            >
              Weiter
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

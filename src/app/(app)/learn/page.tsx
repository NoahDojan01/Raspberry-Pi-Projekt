'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PenLine, ChevronRight, Loader2, CheckCircle2, XCircle,
  AlertTriangle, RotateCcw, Lightbulb, Send, Trophy, Shuffle
} from 'lucide-react'
import { QUESTIONS } from '@/data/questions'
import { getDifficultyColor, getDifficultyLabel, getScoreColor, cn } from '@/lib/utils/helpers'
import type { Question, UserAnswer } from '@/types'

type LearnState = 'running' | 'feedback' | 'finished'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function LearnPage() {
  const [state, setState] = useState<LearnState>('running')
  const [questions] = useState<Question[]>(() => shuffleArray(QUESTIONS))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [lastFeedback, setLastFeedback] = useState<UserAnswer | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const current = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100
  const totalScore = answers.reduce((s, a) => s + a.score * a.maxScore, 0)
  const maxScore = answers.reduce((s, a) => s + a.maxScore, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  useEffect(() => {
    if (state === 'running') textareaRef.current?.focus()
  }, [state, currentIndex])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      submitAnswer()
    }
  }, [currentAnswer, current, evaluating]) // eslint-disable-line

  async function submitAnswer() {
    if (!currentAnswer.trim() || !current || evaluating) return
    setEvaluating(true)

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: current.id,
          question: current.question,
          expectedAnswer: current.answer,
          userAnswer: currentAnswer.trim(),
          difficulty: current.difficulty,
          requiresBrackets: current.requiresBrackets,
          requiresOrder: current.requiresOrder,
          maxScore: current.points,
        }),
      })

      const data = await res.json()
      const answer: UserAnswer = {
        questionId: current.id,
        answer: currentAnswer.trim(),
        score: data.score,
        maxScore: current.points,
        percentage: data.percentage,
        feedback: data.feedback,
        isCorrect: data.isCorrect,
      }

      setLastFeedback(answer)
      setAnswers((prev) => [...prev, answer])
      setState('feedback')
    } catch {
      // fallback: skip evaluation
      const answer: UserAnswer = {
        questionId: current.id,
        answer: currentAnswer.trim(),
        score: 0,
        maxScore: current.points,
        percentage: 0,
        feedback: 'Bewertung nicht verfügbar',
        isCorrect: false,
      }
      setLastFeedback(answer)
      setAnswers((prev) => [...prev, answer])
      setState('feedback')
    } finally {
      setEvaluating(false)
    }
  }

  function goNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setCurrentAnswer('')
      setState('running')
      setLastFeedback(null)
    } else {
      setState('finished')
    }
  }

  function restart() {
    setCurrentIndex(0)
    setAnswers([])
    setCurrentAnswer('')
    setLastFeedback(null)
    setState('running')
  }

  if (state === 'finished') {
    return <FinishedScreen answers={answers} questions={questions} onRestart={restart} />
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <PenLine className="text-violet-400" size={24} />
            Lernmodus
          </h1>
          <p className="text-white/50 text-sm mt-0.5">
            Frage {currentIndex + 1} von {questions.length} · Ergebnisse werden nicht gespeichert
          </p>
        </div>
        <div className="glass rounded-xl px-4 py-2 border border-white/10 text-sm">
          <span className="text-white/40">Ø </span>
          <span className="font-bold text-violet-400">{percentage}%</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-white/30">
          {questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                i < answers.length
                  ? (answers[i]?.isCorrect ? 'bg-emerald-500' : answers[i]?.percentage > 30 ? 'bg-amber-500' : 'bg-rose-500')
                  : i === currentIndex
                  ? 'bg-violet-400 scale-125'
                  : 'bg-white/10'
              )}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-3xl p-8 border border-white/10"
          >
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', getDifficultyColor(current.difficulty))}>
                {getDifficultyLabel(current.difficulty)} · {current.points} {current.points === 1 ? 'Punkt' : 'Punkte'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs border border-white/10 text-white/50 glass">
                {current.category}
              </span>
              <span className="ml-auto text-xs text-white/30">Frage {current.id}</span>
            </div>

            <h2 className="text-xl font-bold leading-relaxed mb-4">{current.question}</h2>

            {(current.requiresBrackets || current.requiresOrder) && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">{current.hint}</p>
              </div>
            )}

            {/* Input phase */}
            {state === 'running' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Deine Antwort <span className="text-white/30 text-xs">(Strg+Enter zum Bestätigen)</span>
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Schreibe deine Antwort hier..."
                    rows={4}
                    className="w-full px-4 py-3 glass rounded-2xl border border-white/10 text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all resize-none text-sm leading-relaxed"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <Lightbulb size={13} />
                    Tippfehler werden toleriert
                  </div>
                  <motion.button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim() || evaluating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20"
                  >
                    {evaluating ? (
                      <><Loader2 size={16} className="animate-spin" /> Bewerte...</>
                    ) : (
                      <><Send size={16} /> Antwort prüfen</>
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Feedback phase */}
            {state === 'feedback' && lastFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Score badge */}
                <div className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border',
                  lastFeedback.isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : lastFeedback.percentage > 30
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-rose-500/10 border-rose-500/20'
                )}>
                  {lastFeedback.isCorrect
                    ? <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    : <XCircle size={20} className="text-rose-400 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/80">Deine Antwort: <span className="text-white/60 italic">{lastFeedback.answer}</span></div>
                    {lastFeedback.feedback && (
                      <div className="text-xs text-violet-300 mt-1">{lastFeedback.feedback}</div>
                    )}
                  </div>
                  <span className={cn('text-lg font-black shrink-0', getScoreColor(lastFeedback.percentage))}>
                    {lastFeedback.percentage}%
                  </span>
                </div>

                {/* Musterlösung */}
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <div className="text-xs font-semibold text-white/40 mb-2">Musterlösung</div>
                  <div className="text-sm text-white/80 leading-relaxed">
                    {current.answer.split('; ').map((part, i) => (
                      <div key={i} className="flex gap-2 mb-1">
                        <span className="text-violet-400/60 shrink-0">•</span>
                        <span>{part}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    onClick={goNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20"
                  >
                    {currentIndex === questions.length - 1 ? (
                      <><Trophy size={16} /> Auswertung</>
                    ) : (
                      <>Weiter <ChevronRight size={16} /></>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FinishedScreen({
  answers, questions, onRestart,
}: {
  answers: UserAnswer[]
  questions: Question[]
  onRestart: () => void
}) {
  const totalScore = answers.reduce((s, a) => s + a.score * a.maxScore, 0)
  const maxScore = answers.reduce((s, a) => s + a.maxScore, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  const correct = answers.filter((a) => a.isCorrect).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-3xl p-8 border border-white/10 text-center"
      >
        <div className={cn(
          'w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl font-black border',
          percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
          percentage >= 60 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
          'bg-rose-500/15 text-rose-400 border-rose-500/30'
        )}>
          {percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '📚'}
        </div>

        <h2 className="text-4xl font-black mb-2">
          <span className={getScoreColor(percentage)}>{percentage}%</span>
        </h2>
        <p className="text-white/50 text-sm mb-6">
          {correct} von {answers.length} Fragen richtig · {Math.round(totalScore * 10) / 10} / {maxScore} Punkte
          <span className="block mt-1 text-white/30">Ergebnisse nicht gespeichert (Lernmodus)</span>
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Richtig', value: correct, color: 'text-emerald-400' },
            { label: 'Teilweise', value: answers.filter(a => a.percentage > 30 && !a.isCorrect).length, color: 'text-amber-400' },
            { label: 'Falsch', value: answers.filter(a => a.percentage <= 30).length, color: 'text-rose-400' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 border border-white/5">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 transition-all"
        >
          <Shuffle size={18} />
          Nochmal (neu gemischt)
        </button>
      </motion.div>

      {/* Answer review */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">Antwortübersicht</h3>
        {answers.map((answer, i) => {
          const q = questions[i]
          return (
            <div
              key={answer.questionId}
              className={cn(
                'glass rounded-2xl p-4 border',
                answer.isCorrect ? 'border-emerald-500/20' :
                answer.percentage > 30 ? 'border-amber-500/20' :
                'border-rose-500/20'
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-sm font-medium text-white/80 flex-1">{q?.question}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {answer.isCorrect
                    ? <CheckCircle2 size={16} className="text-emerald-400" />
                    : <XCircle size={16} className="text-rose-400" />
                  }
                  <span className={cn('text-sm font-bold', getScoreColor(answer.percentage))}>
                    {answer.percentage}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-white/40">
                <span className="text-white/50">Deine Antwort: </span>{answer.answer}
              </div>
              {answer.feedback && (
                <div className="text-xs text-violet-300 bg-violet-500/10 rounded-lg px-3 py-1.5 mt-2">
                  {answer.feedback}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

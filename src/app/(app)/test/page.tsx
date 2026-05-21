'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, ChevronRight, Loader2, CheckCircle2, XCircle,
  AlertTriangle, Trophy, RotateCcw, Lightbulb, Send
} from 'lucide-react'
import { selectSimulationQuestions } from '@/data/questions'
import { getDifficultyColor, getDifficultyLabel, getScoreColor, getScoreGrade, cn } from '@/lib/utils/helpers'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Question, UserAnswer } from '@/types'

type TestState = 'intro' | 'running' | 'evaluating' | 'finished'

export default function TestPage() {
  const router = useRouter()
  const [testState, setTestState] = useState<TestState>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const current = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0
  const totalScore = answers.reduce((s, a) => s + a.score * a.maxScore, 0)
  const maxScore = answers.reduce((s, a) => s + a.maxScore, 0)
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  function startTest() {
    const qs = selectSimulationQuestions()
    setQuestions(qs)
    setCurrentIndex(0)
    setAnswers([])
    setCurrentAnswer('')
    setTestState('running')
  }

  useEffect(() => {
    if (testState === 'running') {
      textareaRef.current?.focus()
    }
  }, [testState, currentIndex])

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
      const userAnswer: UserAnswer = {
        questionId: current.id,
        answer: currentAnswer.trim(),
        score: data.score,
        maxScore: current.points,
        percentage: data.percentage,
        feedback: data.feedback,
        isCorrect: data.isCorrect,
      }

      const newAnswers = [...answers, userAnswer]
      setAnswers(newAnswers)

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1)
        setCurrentAnswer('')
      } else {
        // All questions answered → save session
        setTestState('evaluating')
        await saveSession(newAnswers, questions)
      }
    } catch {
      toast.error('Bewertung fehlgeschlagen. Versuche es erneut.')
    } finally {
      setEvaluating(false)
    }
  }

  async function saveSession(finalAnswers: UserAnswer[], qs: Question[]) {
    setSubmitting(true)
    try {
      const totalS = finalAnswers.reduce((s, a) => s + a.score * a.maxScore, 0)
      const maxS = finalAnswers.reduce((s, a) => s + a.maxScore, 0)
      const pct = maxS > 0 ? (totalS / maxS) * 100 : 0

      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'simulation',
          questions: qs,
          answers: finalAnswers,
          totalScore: totalS,
          maxScore: maxS,
          percentage: pct,
        }),
      })

      const data = await res.json()
      if (data.sessionId) {
        setSessionId(data.sessionId)
        window.dispatchEvent(new CustomEvent('statsUpdated'))
      }
    } catch {
      toast.error('Ergebnis konnte nicht gespeichert werden')
    } finally {
      setSubmitting(false)
      setTestState('finished')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      submitAnswer()
    }
  }

  if (testState === 'intro') return <IntroScreen onStart={startTest} />

  if (testState === 'finished' || testState === 'evaluating') {
    return (
      <FinishedScreen
        answers={answers}
        questions={questions}
        sessionId={sessionId}
        submitting={submitting}
        onRestart={() => setTestState('intro')}
        onViewResults={() => sessionId && router.push(`/results/${sessionId}`)}
      />
    )
  }

  if (!current) return null

  const answeredCount = answers.length

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Target className="text-violet-400" size={24} />
            Simulationstest
          </h1>
          <p className="text-white/50 text-sm mt-0.5">
            Frage {currentIndex + 1} von {questions.length}
          </p>
        </div>
        <div className="glass rounded-xl px-4 py-2 border border-white/10 text-sm">
          <span className="text-white/40">Beantwortet: </span>
          <span className="font-bold text-violet-400">{answeredCount}/{questions.length}</span>
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
                'w-2 h-2 rounded-full transition-all',
                i < answeredCount ? 'bg-violet-500' :
                i === currentIndex ? 'bg-violet-400 scale-125' :
                'bg-white/10'
              )}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
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
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold leading-relaxed mb-2">
            {current.question}
          </h2>

          {/* Special warning */}
          {(current.requiresBrackets || current.requiresOrder) && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">{current.hint}</p>
            </div>
          )}

          {/* Answer input */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-white/60 mb-2">
              Deine Antwort <span className="text-white/30 text-xs">(Strg+Enter zum Bestätigen)</span>
            </label>
            <textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                current.requiresOrder
                  ? 'Gib die Punkte in der richtigen Reihenfolge ein...'
                  : 'Schreibe deine Antwort hier...'
              }
              rows={4}
              className="w-full px-4 py-3 glass rounded-2xl border border-white/10 text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all resize-none leading-relaxed text-sm"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Lightbulb size={13} />
              <span>Rechtschreibfehler werden toleriert</span>
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
              ) : currentIndex === questions.length - 1 ? (
                <><Trophy size={16} /> Test abschließen</>
              ) : (
                <><Send size={16} /> Antwort bestätigen</>
              )}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Intro Screen ──────────────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
          <Target size={36} className="text-violet-400" />
        </div>
        <h1 className="text-4xl font-black mb-3">Simulationstest</h1>
        <p className="text-white/50 text-lg">
          Teste dein Wissen mit 20 zufälligen Prüfungsfragen
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-3xl p-6 border border-white/10"
      >
        <h3 className="font-bold mb-4 text-violet-300">Testregeln</h3>
        <div className="space-y-3">
          {[
            { icon: '🎯', text: '20 zufällige Fragen aus allen 18 Kategorien' },
            { icon: '⚖️', text: 'Gemischt: ca. 7 leicht, 7 mittel, 6 schwere Fragen' },
            { icon: '🤖', text: 'KI-gestützte Bewertung — Tippfehler kein Problem' },
            { icon: '⏱️', text: 'Kein Zeitlimit — nimm dir so viel Zeit wie du brauchst' },
            { icon: '🔒', text: 'Fragen können nicht übersprungen werden' },
            { icon: '⚠️', text: 'Frage 28: Klammer-Inhalte müssen genannt werden' },
            { icon: '🔢', text: 'Frage 80: Gebote in exakter Reihenfolge angeben' },
          ].map((rule) => (
            <div key={rule.text} className="flex items-start gap-3 text-sm">
              <span className="text-lg shrink-0">{rule.icon}</span>
              <span className="text-white/70">{rule.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Fragen', value: '20', sub: 'Gesamt' },
          { label: 'KI-Bewertung', value: '100%', sub: 'Smart' },
          { label: 'Ergebnis', value: 'Sofort', sub: 'Nach Test' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 border border-white/5 text-center">
            <div className="text-2xl font-black gradient-text">{stat.value}</div>
            <div className="text-xs text-white/40 mt-1">{stat.sub}</div>
            <div className="text-xs text-white/60">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-bold text-lg hover:from-violet-500 hover:to-purple-500 transition-all shadow-2xl shadow-violet-500/25"
      >
        <Target size={22} />
        Test starten
        <ChevronRight size={20} />
      </motion.button>
    </div>
  )
}

// ─── Finished Screen ───────────────────────────────────────────────────────────
function FinishedScreen({
  answers, questions, sessionId, submitting, onRestart, onViewResults
}: {
  answers: UserAnswer[]
  questions: Question[]
  sessionId: string | null
  submitting: boolean
  onRestart: () => void
  onViewResults: () => void
}) {
  const totalScore = answers.reduce((s, a) => s + a.score * a.maxScore, 0)
  const maxScore = answers.reduce((s, a) => s + a.maxScore, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  const correct = answers.filter((a) => a.isCorrect).length

  useEffect(() => {
    if (percentage >= 80) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#7c3aed', '#a78bfa', '#c084fc', '#f1f5f9'] })
      })
    }
  }, [percentage])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-3xl p-8 border border-white/10 text-center"
      >
        {submitting ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-violet-400" />
            <p className="text-white/50">Ergebnisse werden gespeichert...</p>
          </div>
        ) : (
          <>
            <div className={cn(
              'w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl font-black',
              percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
              percentage >= 60 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
              'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            )}>
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '📚'}
            </div>

            <h2 className="text-4xl font-black mb-2">
              <span className={getScoreColor(percentage)}>{percentage}%</span>
            </h2>
            <p className="text-xl text-white/80 font-semibold mb-1">{getScoreGrade(percentage)}</p>
            <p className="text-white/40 text-sm mb-6">
              {Math.round(totalScore * 10) / 10} von {maxScore} Punkten · {correct} von {answers.length} Fragen richtig
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

            <div className="flex gap-3">
              <button
                onClick={onRestart}
                className="flex-1 flex items-center justify-center gap-2 py-3 glass rounded-xl border border-white/10 text-sm font-medium hover:border-violet-500/20 transition-all"
              >
                <RotateCcw size={16} />
                Nochmal
              </button>
              {sessionId && (
                <button
                  onClick={onViewResults}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-purple-500 transition-all"
                >
                  <Trophy size={16} />
                  Detailauswertung
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Answer review */}
      {!submitting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="font-bold text-lg">Antwortübersicht</h3>
          {answers.map((answer, i) => {
            const q = questions[i]
            return (
              <div
                key={answer.questionId}
                className={cn(
                  'glass rounded-2xl p-4 border transition-all',
                  answer.isCorrect ? 'border-emerald-500/20' :
                  answer.percentage > 30 ? 'border-amber-500/20' :
                  'border-rose-500/20'
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-sm font-medium text-white/80 flex-1">{q?.question}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {answer.isCorrect ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <XCircle size={18} className="text-rose-400" />
                    )}
                    <span className={cn('text-sm font-bold', getScoreColor(answer.percentage))}>
                      {answer.percentage}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-white/40 mb-1">
                  <span className="text-white/50">Deine Antwort: </span>{answer.answer}
                </div>
                {answer.feedback && (
                  <div className="text-xs text-violet-300 bg-violet-500/10 rounded-lg px-3 py-1.5 mt-2">
                    💬 {answer.feedback}
                  </div>
                )}
              </div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

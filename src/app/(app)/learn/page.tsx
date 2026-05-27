'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PenLine, ChevronRight, Loader2, CheckCircle2, XCircle,
  AlertTriangle, RotateCcw, Lightbulb, Send, Trophy, Shuffle, ThumbsUp, SkipForward
} from 'lucide-react'
import { QUESTIONS } from '@/data/questions'
import { getDifficultyColor, getDifficultyLabel, getScoreColor, cn } from '@/lib/utils/helpers'
import { getAnswerTemplate, parseAnswerDisplay, extractCountFromQuestion } from '@/lib/utils/answerFormat'
import toast from 'react-hot-toast'
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
  const [disputeFeatureEnabled, setDisputeFeatureEnabled] = useState(true)
  const [disputeSubmittedFor, setDisputeSubmittedFor] = useState<Set<number>>(new Set())
  const [submittingDispute, setSubmittingDispute] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const current = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100
  const totalScore = answers.reduce((s, a) => s + a.score * a.maxScore, 0)
  const maxScore = answers.reduce((s, a) => s + a.maxScore, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (typeof data.dispute_feature_enabled === 'boolean') {
          setDisputeFeatureEnabled(data.dispute_feature_enabled)
        }
      })
      .catch(() => {})
  }, [])

  // Pre-fill template for the first question
  useEffect(() => {
    const template = getAnswerTemplate(questions[0]?.question ?? '')
    if (template) setCurrentAnswer(template)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state === 'running') textareaRef.current?.focus()
  }, [state, currentIndex])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      submitAnswer()
    }
  }, [currentAnswer, current, evaluating]) // eslint-disable-line

  function skipQuestion() {
    if (!current) return
    const skipped: UserAnswer = {
      questionId: current.id,
      answer: '',
      score: 0,
      maxScore: current.points,
      percentage: 0,
      feedback: 'Übersprungen',
      isCorrect: false,
    }
    setLastFeedback(skipped)
    setAnswers(prev => [...prev, skipped])
    setState('feedback')
  }

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
      const nextQ = questions[currentIndex + 1]
      setCurrentIndex((i) => i + 1)
      setCurrentAnswer(getAnswerTemplate(nextQ.question))
      setState('running')
      setLastFeedback(null)
    } else {
      setState('finished')
    }
  }

  function restart() {
    setCurrentIndex(0)
    setAnswers([])
    setCurrentAnswer(getAnswerTemplate(questions[0]?.question ?? ''))
    setLastFeedback(null)
    setDisputeSubmittedFor(new Set())
    setState('running')
  }

  async function submitDispute() {
    if (!lastFeedback || !current || submittingDispute) return
    setSubmittingDispute(true)
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: current.id, userAnswer: lastFeedback.answer }),
      })
      if (!res.ok) throw new Error()
      setDisputeSubmittedFor(prev => new Set(prev).add(current.id))
      toast.success('Anfrage gesendet!')
    } catch {
      toast.error('Anfrage konnte nicht gesendet werden')
    } finally {
      setSubmittingDispute(false)
    }
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
            <PenLine className="text-accent" size={24} />
            Lernmodus
          </h1>
          <p className="text-ui/50 text-sm mt-0.5">
            Frage {currentIndex + 1} von {questions.length} · Ergebnisse werden nicht gespeichert
          </p>
        </div>
        <div className="glass rounded-xl px-4 py-2 border border-ui/10 text-sm">
          <span className="text-ui/40">Ø </span>
          <span className="font-bold text-accent">{percentage}%</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="h-2 bg-ui/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent to-accent rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-ui/30">
          {questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                i < answers.length
                  ? (answers[i]?.isCorrect ? 'bg-emerald-500' : answers[i]?.percentage > 30 ? 'bg-accent' : 'bg-rose-500')
                  : i === currentIndex
                  ? 'bg-accent scale-125'
                  : 'bg-ui/10'
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
            className="glass-strong rounded-3xl p-8 border border-ui/10"
          >
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', getDifficultyColor(current.difficulty))}>
                {getDifficultyLabel(current.difficulty)} · {current.points} {current.points === 1 ? 'Punkt' : 'Punkte'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs border border-ui/10 text-ui/50 glass">
                {current.category}
              </span>
              <span className="ml-auto text-xs text-ui/30">Frage {current.id}</span>
            </div>

            <h2 className="text-xl font-bold leading-relaxed mb-4">{current.question}</h2>

            {(current.requiresBrackets || current.requiresOrder) && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
                <AlertTriangle size={15} className="text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-accent/70">{current.hint}</p>
              </div>
            )}

            {/* Input phase */}
            {state === 'running' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ui/60 mb-2">
                    Deine Antwort <span className="text-ui/30 text-xs">(Strg+Enter zum Bestätigen)</span>
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Schreibe deine Antwort hier..."
                    rows={Math.max(4, Math.min(12, (extractCountFromQuestion(current?.question ?? '') ?? 0) + 2))}
                    className="w-full px-4 py-3 glass rounded-2xl border border-ui/10 text-ui placeholder-ui/20 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all resize-none text-sm leading-relaxed"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-ui/30">
                    <Lightbulb size={13} />
                    Tippfehler werden toleriert
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={skipQuestion}
                      disabled={evaluating}
                      className="flex items-center gap-1.5 px-4 py-2.5 glass rounded-xl border border-ui/15 text-sm text-ui/65 hover:text-ui/90 hover:border-ui/30 transition-all"
                    >
                      <SkipForward size={14} />
                      Überspringen
                    </button>
                    <motion.button
                      onClick={submitAnswer}
                      disabled={!currentAnswer.trim() || evaluating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:from-accent hover:to-accent transition-all shadow-lg shadow-accent/15"
                    >
                      {evaluating ? (
                        <><Loader2 size={16} className="animate-spin" /> Bewerte...</>
                      ) : (
                        <><Send size={16} /> Antwort prüfen</>
                      )}
                    </motion.button>
                  </div>
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
                    ? 'bg-accent/10 border-accent/20'
                    : 'bg-rose-500/10 border-rose-500/20'
                )}>
                  {lastFeedback.isCorrect
                    ? <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    : <XCircle size={20} className="text-rose-400 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ui/80">Deine Antwort: <span className="text-ui/60 italic">{lastFeedback.answer}</span></div>
                    {lastFeedback.feedback && (
                      <div className="text-xs text-accent/70 mt-1">{lastFeedback.feedback}</div>
                    )}
                  </div>
                  <span className={cn('text-lg font-black shrink-0', getScoreColor(lastFeedback.percentage))}>
                    {lastFeedback.percentage}%
                  </span>
                </div>

                {/* Musterlösung */}
                <div className="glass rounded-2xl p-4 border border-ui/10">
                  <div className="text-xs font-semibold text-ui/40 mb-2">Musterlösung</div>
                  <div className="text-sm text-ui/80 leading-relaxed">
                    {(() => {
                      const { type, parts } = parseAnswerDisplay(current.answer)
                      if (type === 'plain') return <p>{parts[0]}</p>
                      return parts.map((part, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                          {type === 'numbered'
                            ? <span className="text-accent/60 shrink-0 font-medium min-w-[1.5rem]">{i + 1}.</span>
                            : <span className="text-accent/60 shrink-0">•</span>
                          }
                          <span>{part}</span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Dispute button */}
                  {disputeSubmittedFor.has(current.id) ? (
                    <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 size={13} />
                      Anfrage gesendet
                    </span>
                  ) : (
                    <motion.button
                      onClick={submitDispute}
                      disabled={!disputeFeatureEnabled || submittingDispute}
                      whileHover={disputeFeatureEnabled ? { scale: 1.02 } : {}}
                      whileTap={disputeFeatureEnabled ? { scale: 0.98 } : {}}
                      title={disputeFeatureEnabled ? 'Antwort als richtig melden' : 'Diese Funktion ist für dich deaktiviert'}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                        disputeFeatureEnabled
                          ? 'glass border-ui/20 text-ui/70 hover:text-ui/95 hover:border-accent/35'
                          : 'glass border-ui/8 text-ui/30 cursor-not-allowed opacity-50'
                      )}
                    >
                      {submittingDispute
                        ? <Loader2 size={13} className="animate-spin" />
                        : <ThumbsUp size={13} />
                      }
                      Meine Antwort war richtig
                    </motion.button>
                  )}

                  <motion.button
                    onClick={goNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent rounded-xl font-semibold text-sm hover:from-accent hover:to-accent transition-all shadow-lg shadow-accent/15"
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
        className="glass-strong rounded-3xl p-8 border border-ui/10 text-center"
      >
        <div className={cn(
          'w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl font-black border',
          percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
          percentage >= 60 ? 'bg-accent/15 text-accent border-accent/30' :
          'bg-rose-500/15 text-rose-400 border-rose-500/30'
        )}>
          {percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '📚'}
        </div>

        <h2 className="text-4xl font-black mb-2">
          <span className={getScoreColor(percentage)}>{percentage}%</span>
        </h2>
        <p className="text-ui/50 text-sm mb-6">
          {correct} von {answers.length} Fragen richtig · {Math.round(totalScore * 10) / 10} / {maxScore} Punkte
          <span className="block mt-1 text-ui/30">Ergebnisse nicht gespeichert (Lernmodus)</span>
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Richtig', value: correct, color: 'text-emerald-400' },
            { label: 'Teilweise', value: answers.filter(a => a.percentage > 30 && !a.isCorrect).length, color: 'text-accent' },
            { label: 'Falsch', value: answers.filter(a => a.percentage <= 30).length, color: 'text-rose-400' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 border border-ui/5">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-ui/40">{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-accent to-accent rounded-xl font-semibold hover:from-accent hover:to-accent transition-all"
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
                answer.percentage > 30 ? 'border-accent/20' :
                'border-rose-500/20'
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-sm font-medium text-ui/80 flex-1">{q?.question}</span>
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
              <div className="text-xs text-ui/40">
                <span className="text-ui/50">Deine Antwort: </span>{answer.answer}
              </div>
              {answer.feedback && (
                <div className="text-xs text-accent/70 bg-accent/10 rounded-lg px-3 py-1.5 mt-2">
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

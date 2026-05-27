'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy, ArrowLeft, CheckCircle2, XCircle,
  Calendar, Zap, Target, BarChart3
} from 'lucide-react'
import {
  getScoreColor, getScoreGrade, getDifficultyColor,
  getDifficultyLabel, formatDate, cn
} from '@/lib/utils/helpers'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

interface Answer {
  id: string; question_id: number; question_text: string; user_answer: string
  expected_answer: string; score: number; max_score: number; percentage: number
  feedback: string; difficulty: string; category: string
}

interface Session {
  id: string; mode: string; total_score: number; max_score: number
  percentage: number; questions_count: number; xp_earned: number
  completed_at: string; started_at: string
}

interface ResultsClientProps {
  session: Session
  answers: Answer[]
}

export default function ResultsClient({ session, answers }: ResultsClientProps) {
  const percentage = Math.round(session.percentage)
  const correct = answers.filter(a => a.percentage >= 70).length

  useEffect(() => {
    if (percentage >= 80) {
      import('canvas-confetti').then(({ default: confetti }) => {
        setTimeout(() => {
          confetti({ particleCount: 120, spread: 60, origin: { y: 0.6 }, colors: ['#7c3aed', '#a78bfa', '#f1f5f9'] })
        }, 500)
      })
    }
  }, [percentage])

  // Radar chart data by category
  const categoryScores = answers.reduce<Record<string, { total: number; count: number }>>((acc, a) => {
    if (!acc[a.category]) acc[a.category] = { total: 0, count: 0 }
    acc[a.category].total += a.percentage
    acc[a.category].count++
    return acc
  }, {})

  const radarData = Object.entries(categoryScores).map(([cat, data]) => ({
    category: cat.length > 12 ? cat.slice(0, 12) + '…' : cat,
    score: Math.round(data.total / data.count),
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-ui/50 hover:text-ui transition-colors"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
        <span className="text-ui/20">/</span>
        <span className="text-sm text-ui/60">Testergebnis</span>
      </div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 border border-ui/10 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            'absolute inset-0 opacity-5',
            percentage >= 80 ? 'bg-emerald-500' :
            percentage >= 60 ? 'bg-accent' : 'bg-rose-500'
          )} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy size={28} className="text-accent" />
            <h1 className="text-3xl font-black">Ergebnis</h1>
          </div>

          <div className={`text-7xl font-black mb-2 ${getScoreColor(percentage)}`}>
            {percentage}%
          </div>
          <p className="text-2xl font-semibold text-ui/80 mb-6">{getScoreGrade(percentage)}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Target, label: 'Punkte', value: `${Math.round(session.total_score * 10) / 10} / ${session.max_score}`, color: 'text-accent' },
              { icon: CheckCircle2, label: 'Richtig', value: `${correct} / ${answers.length}`, color: 'text-emerald-400' },
              { icon: Zap, label: 'XP erhalten', value: `+${session.xp_earned}`, color: 'text-accent' },
              { icon: Calendar, label: 'Abgeschlossen', value: formatDate(session.completed_at).split(',')[0], color: 'text-indigo-400' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="glass rounded-xl p-3 border border-ui/5">
                  <Icon size={18} className={cn('mx-auto mb-1', stat.color)} />
                  <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-ui/40">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Score breakdown by difficulty */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {(['leicht', 'mittel', 'schwer'] as const).map((diff) => {
          const diffAnswers = answers.filter(a => a.difficulty === diff)
          const diffCorrect = diffAnswers.filter(a => a.percentage >= 70).length
          const diffPct = diffAnswers.length > 0 ? Math.round((diffCorrect / diffAnswers.length) * 100) : 0
          return (
            <div key={diff} className={cn('glass rounded-2xl p-5 border', getDifficultyColor(diff).split(' ')[2])}>
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-sm font-semibold', getDifficultyColor(diff).split(' ')[0])}>
                  {getDifficultyLabel(diff)}
                </span>
                <span className="text-xs text-ui/40">{diffAnswers.length} Fragen</span>
              </div>
              <div className="text-3xl font-black">{diffPct}%</div>
              <div className="text-xs text-ui/50 mt-1">{diffCorrect}/{diffAnswers.length} richtig</div>
              <div className="h-1.5 bg-ui/5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${diffPct}%`,
                    background: diff === 'leicht' ? '#10b981' : diff === 'mittel' ? '#f59e0b' : '#f43f5e'
                  }}
                />
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Radar chart + Answers list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {radarData.length > 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border border-ui/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-accent" />
              <h3 className="font-bold">Nach Kategorie</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,10,30,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-ui/5 lg:col-span-1"
        >
          <h3 className="font-bold mb-4">Schnellübersicht</h3>
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="flex items-center gap-3 text-sm"
              >
                {answer.percentage >= 70 ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-rose-400 shrink-0" />
                )}
                <span className="text-ui/60 flex-1 truncate">{answer.question_text}</span>
                <span className={cn('font-bold shrink-0', getScoreColor(answer.percentage))}>
                  {answer.percentage}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed answers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="font-bold text-xl">Detailauswertung</h3>
        {answers.map((answer, i) => (
          <div
            key={answer.id}
            className={cn(
              'glass rounded-2xl p-5 border',
              answer.percentage >= 70 ? 'border-emerald-500/15' :
              answer.percentage > 30 ? 'border-accent/15' :
              'border-rose-500/15'
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ui/40">#{i + 1}</span>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', getDifficultyColor(answer.difficulty as 'leicht' | 'mittel' | 'schwer'))}>
                  {getDifficultyLabel(answer.difficulty as 'leicht' | 'mittel' | 'schwer')}
                </span>
                <span className="text-xs text-ui/40 glass px-2 py-0.5 rounded-full border border-ui/5">{answer.category}</span>
              </div>
              <div className={`font-black text-xl ${getScoreColor(answer.percentage)}`}>
                {answer.percentage}%
              </div>
            </div>

            <p className="font-semibold text-sm mb-3">{answer.question_text}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3 border border-ui/5">
                <div className="text-xs text-ui/40 mb-1">Deine Antwort</div>
                <div className="text-sm text-ui/80">{answer.user_answer || '(keine Antwort)'}</div>
              </div>
              <div className="glass rounded-xl p-3 border border-emerald-500/10 bg-emerald-500/5">
                <div className="text-xs text-emerald-400 mb-1">Musterlösung</div>
                <div className="text-sm text-ui/80">{answer.expected_answer}</div>
              </div>
            </div>

            {answer.feedback && (
              <div className="mt-3 text-xs text-accent/70 bg-accent/10 border border-accent/20 rounded-xl px-3 py-2">
                💬 {answer.feedback}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Actions */}
      <div className="flex gap-4 pb-8">
        <Link
          href="/test"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-accent to-accent rounded-2xl font-semibold hover:from-accent hover:to-accent transition-all shadow-lg shadow-accent/15"
        >
          <Target size={18} />
          Neuer Test
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-3.5 glass rounded-2xl border border-ui/10 font-medium hover:border-accent/20 transition-all"
        >
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </div>
    </div>
  )
}

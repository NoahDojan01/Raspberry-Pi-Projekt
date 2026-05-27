'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy, Target, BookOpen, Flame, Star, TrendingUp,
  ChevronRight, Calendar, Zap, Award, BarChart3
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import {
  calculateXPToNextLevel, getLevelTitle, getScoreColor,
  getScoreGrade, formatRelativeDate, cn
} from '@/lib/utils/helpers'
import { QUESTIONS } from '@/data/questions'

interface DashboardClientProps {
  stats: {
    xp: number; level: number; streak: number;
    total_tests: number; average_score: number; best_score: number;
    total_questions_answered: number
  } | null
  recentSessions: Array<{
    id: string; mode: string; percentage: number; total_score: number;
    max_score: number; questions_count: number; xp_earned: number; completed_at: string
  }>
  userName: string
}

const categoryCount = [...new Set(QUESTIONS.map(q => q.category))].length

export default function DashboardClient({ stats, recentSessions, userName }: DashboardClientProps) {
  const xp = stats?.xp || 0
  const level = stats?.level || 1
  const streak = stats?.streak || 0
  const totalTests = stats?.total_tests || 0
  const avgScore = stats?.average_score || 0
  const bestScore = stats?.best_score || 0
  const xpProgress = calculateXPToNextLevel(xp)

  const chartData = recentSessions
    .slice(0, 7)
    .reverse()
    .map((s, i) => ({ name: `Test ${i + 1}`, score: Math.round(s.percentage) }))

  const radialData = [{ value: Math.round(avgScore), fill: '#7c3aed' }]

  const staggerChild = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.08, duration: 0.4 }
    })
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black">
            Hallo, <span className="gradient-text">{userName}</span> 👋
          </h1>
          <p className="text-ui/50 mt-1">
            {streak > 0
              ? `${streak} Tage Streak! Weiter so! 🔥`
              : 'Bereit für die nächste Lernsession?'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/learn"
            className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl border border-accent/20 text-accent/70 hover:border-accent/30 transition-all text-sm font-medium hover:-translate-y-0.5"
          >
            <BookOpen size={16} />
            Lernen
          </Link>
          <Link
            href="/test"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent to-accent rounded-xl text-ui hover:from-accent hover:to-accent transition-all text-sm font-semibold hover:-translate-y-0.5 shadow-lg shadow-accent/15"
          >
            <Target size={16} />
            Test starten
          </Link>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Star, label: 'Level', value: level, sub: getLevelTitle(level), color: 'amber', glow: 'glow-accent' },
          { icon: Flame, label: 'Streak', value: streak, sub: 'Tage in Folge', color: 'orange' },
          { icon: Trophy, label: 'Tests', value: totalTests, sub: 'Abgeschlossen', color: 'emerald' },
          { icon: Zap, label: 'XP', value: xp.toLocaleString('de'), sub: 'Erfahrungspunkte', color: 'amber' },
        ].map((card, i) => {
          const Icon = card.icon
          const colorMap: Record<string, string> = {
            amber: 'text-accent bg-accent/10',
            orange: 'text-orange-400 bg-orange-400/10',
            emerald: 'text-emerald-400 bg-emerald-400/10',
          }
          return (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={staggerChild}
              className="glass-hover glass rounded-2xl p-5 border border-ui/5"
            >
              <div className={`w-10 h-10 rounded-xl ${colorMap[card.color]} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-black">{card.value}</div>
              <div className="text-xs text-ui/40 mt-0.5">{card.sub}</div>
              <div className="text-xs text-ui/60 font-medium mt-1">{card.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* XP Progress + Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-ui/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-accent" />
            <h3 className="font-bold">Level Fortschritt</h3>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="60%" outerRadius="80%"
                  data={[{ value: xpProgress.percentage, fill: '#7c3aed' }]}
                  startAngle={90} endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.05)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black gradient-text">{level}</span>
                <span className="text-xs text-ui/40">Level</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-ui/50">
              <span>{xpProgress.current} XP</span>
              <span>{xpProgress.needed} XP</span>
            </div>
            <div className="h-2 bg-ui/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percentage}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-accent to-accent rounded-full"
              />
            </div>
            <p className="text-xs text-center text-ui/40">{getLevelTitle(level + 1)} bei Level {level + 1}</p>
          </div>
        </motion.div>

        {/* Score chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-6 border border-ui/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-accent" />
              <h3 className="font-bold">Letzte Testergebnisse</h3>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-black ${getScoreColor(Math.round(avgScore))}`}>
                {Math.round(avgScore)}%
              </div>
              <div className="text-xs text-ui/40">Durchschnitt</div>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,10,30,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Ergebnis']}
                />
                <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#a78bfa' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-ui/30 text-sm">
              Noch keine Tests absolviert
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions + Recent tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-ui/5"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            Schnellstart
          </h3>
          <div className="space-y-3">
            {[
              { href: '/learn', icon: BookOpen, title: 'Lernmodus', desc: `Alle ${QUESTIONS.length} Fragen durchgehen`, color: 'from-accent/20 to-accent/20', border: 'border-accent/20' },
              { href: '/test', icon: Target, title: 'Simulationstest', desc: '20 zufällige Prüfungsfragen', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20' },
              { href: '/upload', icon: TrendingUp, title: 'PDF hochladen', desc: 'Eigene Fragen importieren', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn('flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r border transition-all hover:-translate-y-0.5 hover:border-accent/25 group', action.color, action.border)}
                >
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs text-ui/50">{action.desc}</div>
                  </div>
                  <ChevronRight size={16} className="text-ui/30 group-hover:text-accent transition-colors" />
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Recent tests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 border border-ui/5"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-accent" />
            Letzte Tests
          </h3>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  href={`/results/${session.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl glass border border-ui/5 hover:border-accent/20 transition-all group"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black',
                    session.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                    session.percentage >= 60 ? 'bg-accent/15 text-accent' :
                    'bg-rose-500/15 text-rose-400'
                  )}>
                    {Math.round(session.percentage)}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {session.mode === 'simulation' ? 'Simulationstest' : 'Lernmodus'}
                    </div>
                    <div className="text-xs text-ui/40">
                      {formatRelativeDate(session.completed_at)} · +{session.xp_earned} XP
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Details →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] text-ui/30">
              <Trophy size={32} className="mb-3 opacity-50" />
              <p className="text-sm">Noch keine Tests gemacht</p>
              <Link href="/test" className="mt-3 text-xs text-accent hover:text-accent">
                Ersten Test starten →
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Stats overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass rounded-2xl p-6 border border-ui/5"
      >
        <h3 className="font-bold mb-4">Gesamtstatistik</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Bestes Ergebnis', value: `${Math.round(bestScore)}%`, sub: getScoreGrade(bestScore), color: getScoreColor(bestScore) },
            { label: 'Durchschnitt', value: `${Math.round(avgScore)}%`, sub: 'Aller Tests', color: getScoreColor(avgScore) },
            { label: 'Tests gesamt', value: totalTests, sub: 'Absolviert', color: 'text-accent' },
            { label: 'Kategorien', value: categoryCount, sub: 'Verfügbar', color: 'text-indigo-400' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 glass rounded-xl border border-ui/5">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-ui/40 mt-1">{stat.sub}</div>
              <div className="text-xs text-ui/60 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

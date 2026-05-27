'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Crown, Flame, Target, BarChart3,
  Zap, Trophy, Star, Loader2, Lock, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, getLevelTitle, getScoreColor, formatRelativeDate } from '@/lib/utils/helpers'

interface Stats {
  xp: number; level: number; streak: number; total_tests: number
  average_score: number; best_score: number; total_questions_answered: number
}
interface Session {
  id: string; mode: string; percentage: number
  xp_earned: number; completed_at: string; questions_count: number
}
interface UserData {
  name: string
  stats: Stats | null
  sessions: Session[]
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()

  const [data, setData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [togglingFav, setTogglingFav] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${userId}`),
      fetch('/api/favorites'),
    ]).then(async ([userRes, favRes]) => {
      const favData = await favRes.json()
      setFavoriteIds(favData.favoriteIds ?? [])

      if (!userRes.ok) {
        const err = await userRes.json()
        if (userRes.status === 403) setError('kein_zugriff')
        else setError(err.error ?? 'Fehler')
        return
      }
      setData(await userRes.json())
    }).finally(() => setLoading(false))
  }, [userId])

  async function toggleFavorite() {
    const isFav = favoriteIds.includes(userId)
    setTogglingFav(true)
    const res = await fetch('/api/favorites', {
      method: isFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const result = await res.json()
    if (res.ok) {
      setFavoriteIds(result.favoriteIds ?? [])
      toast.success(isFav ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt')
    } else {
      toast.error(result.message ?? result.error ?? 'Fehler')
    }
    setTogglingFav(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-ui/30">
        <Loader2 size={28} className="animate-spin" />
      </div>
    )
  }

  if (error === 'kein_zugriff') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-ui/5 flex items-center justify-center mx-auto">
          <Lock size={28} className="text-ui/20" />
        </div>
        <h2 className="text-xl font-bold text-ui/60">Kein Zugriff</h2>
        <p className="text-ui/30 text-sm">
          Du musst in derselben Gruppe sein oder die Person favorisiert haben.
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mx-auto px-4 py-2 glass rounded-xl border border-ui/10 text-sm text-ui/50 hover:text-ui/80 transition-colors"
        >
          <ArrowLeft size={15} />
          Zurück
        </button>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <p className="text-ui/40">{error ?? 'Nutzer nicht gefunden'}</p>
        <button onClick={() => router.back()} className="text-accent text-sm hover:text-accent">
          Zurück
        </button>
      </div>
    )
  }

  const { name, stats, sessions } = data
  const isFav = favoriteIds.includes(userId)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back + Favorite */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ui/40 hover:text-ui/70 transition-colors"
        >
          <ArrowLeft size={16} />
          Zurück
        </button>
        <button
          onClick={toggleFavorite}
          disabled={togglingFav}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all',
            isFav
              ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/15'
              : 'glass border-ui/10 text-ui/40 hover:text-accent hover:border-accent/30'
          )}
        >
          {togglingFav
            ? <Loader2 size={14} className="animate-spin" />
            : <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
          }
          {isFav ? 'Favorisiert' : 'Favorisieren'}
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent flex items-center justify-center text-2xl font-black text-ui shrink-0 shadow-lg shadow-accent/15">
          {name[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-3xl font-black">{name}</h1>
          <p className="text-ui/40 text-sm mt-0.5">
            {getLevelTitle(stats?.level ?? 1)} · Level {stats?.level ?? 1}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-6 border border-ui/5"
      >
        <h2 className="font-bold flex items-center gap-2 text-ui/80 mb-4">
          <BarChart3 size={18} className="text-accent" />
          Statistiken
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Level', value: stats?.level ?? 1, sub: getLevelTitle(stats?.level ?? 1), icon: Crown, color: 'text-accent' },
            { label: 'XP', value: (stats?.xp ?? 0).toLocaleString('de'), sub: 'Erfahrungspunkte', icon: Zap, color: 'text-accent' },
            { label: 'Streak', value: `${stats?.streak ?? 0}`, sub: 'Tage in Folge', icon: Flame, color: 'text-orange-400' },
            { label: 'Tests', value: stats?.total_tests ?? 0, sub: 'Abgeschlossen', icon: Target, color: 'text-emerald-400' },
            { label: 'Durchschnitt', value: `${Math.round(stats?.average_score ?? 0)}%`, sub: 'Aller Tests', icon: BarChart3, color: getScoreColor(stats?.average_score ?? 0) },
            { label: 'Bestes Ergebnis', value: `${Math.round(stats?.best_score ?? 0)}%`, sub: 'Simulationstest', icon: Trophy, color: getScoreColor(stats?.best_score ?? 0) },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl p-3 border border-ui/5 text-center">
              <Icon size={16} className={cn('mx-auto mb-1.5', color)} />
              <div className={cn('text-xl font-black', color)}>{value}</div>
              <div className="text-xs text-ui/50 mt-0.5">{sub}</div>
              <div className="text-xs text-ui/30">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent tests */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-ui/5"
      >
        <h2 className="font-bold flex items-center gap-2 text-ui/80 mb-4">
          <Target size={18} className="text-accent" />
          Letzte Tests
        </h2>
        {sessions.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <X size={28} className="mx-auto text-ui/15" />
            <p className="text-ui/30 text-sm">Noch keine Tests absolviert</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-3 py-2.5 glass rounded-xl border border-ui/5"
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0',
                  s.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                  s.percentage >= 60 ? 'bg-accent/15 text-accent' :
                  'bg-rose-500/15 text-rose-400'
                )}>
                  {Math.round(s.percentage)}%
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ui/70">
                    {s.mode === 'simulation' ? 'Simulationstest' : 'Lernmodus'}
                    <span className="text-ui/30 ml-1.5">· {s.questions_count} Fragen</span>
                  </div>
                  <div className="text-xs text-ui/30 mt-0.5">
                    {formatRelativeDate(s.completed_at)} · +{s.xp_earned} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="h-4" />
    </div>
  )
}

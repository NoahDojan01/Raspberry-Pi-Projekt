'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Save, Loader2, Star, ChevronDown, ChevronUp,
  Trophy, Flame, Target, BarChart3, Zap, Users, Crown, Edit2, X, Check,
  Sun, Moon, Palette, Settings
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn, getLevelTitle, getScoreColor, formatRelativeDate } from '@/lib/utils/helpers'
import { applyAccentColor, applyNeutralAccent, ACCENT_STORAGE_KEY, DEFAULT_ACCENT_HEX, THEME_MODE_KEY, ThemeMode } from '@/components/AccentProvider'
import ColorPicker from '@/components/ColorPicker'

interface Stats {
  xp: number; level: number; streak: number; total_tests: number
  average_score: number; best_score: number; total_questions_answered: number
}
interface FavoriteUser {
  userId: string; name: string; xp: number; level: number
  streak: number; total_tests: number; best_score: number; average_score: number
}
interface UserDetails {
  name: string
  stats: Stats | null
  sessions: Array<{
    id: string; mode: string; percentage: number
    xp_earned: number; completed_at: string; questions_count: number
  }>
}
interface GroupMember {
  rank: number; userId: string; name: string
  xp: number; level: number; streak: number
  totalTests: number; bestScore: number; isMe: boolean
}

interface Props {
  initialName: string
  email: string
  stats: Stats | null
}

export default function ProfileClient({ initialName, email, stats }: Props) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [nameValue, setNameValue] = useState(initialName)
  const [editingName, setEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [namePending, setNamePending] = useState(false)

  const [emailValue, setEmailValue] = useState(email)
  const [editingEmail, setEditingEmail] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  const [favorites, setFavorites] = useState<FavoriteUser[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [togglingFav, setTogglingFav] = useState<string | null>(null)

  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [expandedFavId, setExpandedFavId] = useState<string | null>(null)
  const [detailsCache, setDetailsCache] = useState<Map<string, UserDetails>>(new Map())
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null)

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
  const [groupMembersCache, setGroupMembersCache] = useState<Map<string, GroupMember[]>>(new Map())
  const [loadingGroupMembers, setLoadingGroupMembers] = useState<string | null>(null)

  const [colorMode, setColorMode] = useState<ThemeMode>('dark')
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_HEX)

  useEffect(() => {
    const savedMode = (localStorage.getItem(THEME_MODE_KEY) ?? 'dark') as ThemeMode
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) ?? DEFAULT_ACCENT_HEX
    setColorMode(savedMode)
    setAccentColor(savedAccent)
    // Sync with server for cross-device (profile page is the sync point)
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (!data.theme_preference) return
        try {
          const pref = JSON.parse(data.theme_preference) as { mode: ThemeMode; accent?: string }
          if (!pref.mode || pref.mode === savedMode) return
          setColorMode(pref.mode)
          const isLight = pref.mode === 'light' || pref.mode === 'color-light'
          setTheme(isLight ? 'light' : 'dark')
          if (pref.mode === 'color-dark' || pref.mode === 'color-light') {
            const accent = pref.accent ?? DEFAULT_ACCENT_HEX
            setAccentColor(accent)
            applyAccentColor(accent)
            localStorage.setItem(ACCENT_STORAGE_KEY, accent)
          } else {
            applyNeutralAccent(isLight ? 'light' : 'dark')
          }
          localStorage.setItem(THEME_MODE_KEY, pref.mode)
        } catch { /* ignore */ }
      })
      .catch(() => {})
  }, []) // eslint-disable-line

  useEffect(() => {
    Promise.all([
      fetch('/api/favorites').then(r => r.json()),
      fetch('/api/groups').then(r => r.json()),
    ]).then(([favData, groupData]) => {
      const favList: FavoriteUser[] = favData.favorites ?? []
      setFavorites(favList)
      setFavoriteIds(favData.favoriteIds ?? favList.map((f: FavoriteUser) => f.userId))
      setGroups(groupData.groups ?? [])
    }).finally(() => setLoadingFavorites(false))
  }, [])

  async function saveName() {
    const trimmed = nameValue.trim()
    if (!trimmed) return
    setSavingName(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    const data = await res.json()
    if (res.ok) {
      if (data.pending) {
        toast.success('Namensänderung eingereicht – wartet auf Admin-Bestätigung')
        setNamePending(true)
      } else {
        toast.success('Name gespeichert')
      }
      setEditingName(false)
    } else {
      toast.error(data.error)
    }
    setSavingName(false)
  }

  async function saveEmail() {
    const trimmed = emailValue.trim()
    if (!trimmed) return
    setSavingEmail(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed }),
    })
    const data = await res.json()
    if (res.ok) { toast.success(data.message, { duration: 6000 }); setEditingEmail(false) }
    else toast.error(data.error)
    setSavingEmail(false)
  }

  async function toggleFavorite(userId: string) {
    const isFav = favoriteIds.includes(userId)
    setTogglingFav(userId)
    const res = await fetch('/api/favorites', {
      method: isFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (res.ok) {
      const newIds: string[] = data.favoriteIds ?? []
      setFavoriteIds(newIds)
      if (isFav) {
        setFavorites(prev => prev.filter(f => f.userId !== userId))
        if (expandedFavId === userId) setExpandedFavId(null)
      }
      toast.success(isFav ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt')
    } else {
      toast.error(data.message ?? data.error ?? 'Fehler')
    }
    setTogglingFav(null)
  }

  async function toggleFavDetails(userId: string) {
    if (expandedFavId === userId) { setExpandedFavId(null); return }
    setExpandedFavId(userId)
    if (detailsCache.has(userId)) return
    setLoadingDetails(userId)
    const res = await fetch(`/api/users/${userId}`)
    const data = await res.json()
    if (res.ok) setDetailsCache(prev => new Map(prev).set(userId, data))
    else toast.error('Details konnten nicht geladen werden')
    setLoadingDetails(null)
  }

  async function toggleGroupMembers(groupId: string) {
    if (expandedGroupId === groupId) { setExpandedGroupId(null); return }
    setExpandedGroupId(groupId)
    if (groupMembersCache.has(groupId)) return
    setLoadingGroupMembers(groupId)
    const res = await fetch(`/api/leaderboard?groupId=${groupId}`)
    const data = await res.json()
    if (res.ok) setGroupMembersCache(prev => new Map(prev).set(groupId, data.entries ?? []))
    else toast.error('Mitglieder konnten nicht geladen werden')
    setLoadingGroupMembers(null)
  }

  function saveThemeToApi(mode: ThemeMode, accent: string) {
    fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme_preference: JSON.stringify({ mode, accent }) }),
    }).catch(() => {})
  }

  function handleColorMode(mode: ThemeMode) {
    setColorMode(mode)
    const isLight = mode === 'light' || mode === 'color-light'
    setTheme(isLight ? 'light' : 'dark')
    if (mode === 'dark' || mode === 'light') {
      applyNeutralAccent(isLight ? 'light' : 'dark')
    } else {
      applyAccentColor(accentColor)
      localStorage.setItem(ACCENT_STORAGE_KEY, accentColor)
    }
    localStorage.setItem(THEME_MODE_KEY, mode)
    saveThemeToApi(mode, accentColor)
  }

  function handleTopMode(top: 'dark' | 'light' | 'color') {
    if (top === 'dark') { handleColorMode('dark'); return }
    if (top === 'light') { handleColorMode('light'); return }
    // Switch to color mode keeping current dark/light base
    if (colorMode === 'color-dark' || colorMode === 'color-light') return
    handleColorMode(colorMode === 'light' ? 'color-light' : 'color-dark')
  }

  function handleAccentChange(hex: string) {
    setAccentColor(hex)
    applyAccentColor(hex)
    localStorage.setItem(ACCENT_STORAGE_KEY, hex)
    saveThemeToApi(colorMode, hex)
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent flex items-center justify-center text-2xl font-black text-ui shrink-0 shadow-lg shadow-accent/15">
          {nameValue[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-3xl font-black">{nameValue}</h1>
          <p className="text-ui/40 text-sm mt-0.5">{getLevelTitle(stats?.level ?? 1)} · Level {stats?.level ?? 1}</p>
        </div>
      </motion.div>

      {/* Personal data */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-strong rounded-3xl p-6 border border-ui/10 space-y-5"
      >
        <h2 className="font-bold flex items-center gap-2 text-ui/80">
          <User size={18} className="text-accent" />
          Persönliche Daten
        </h2>

        {/* Name */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className="text-xs text-ui/40 font-medium">Name</label>
            {namePending && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium">
                Ausstehend
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && editingName && saveName()}
              disabled={!editingName}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all',
                editingName
                  ? 'glass border-accent/40 text-ui focus:outline-none focus:ring-1 focus:ring-accent/20'
                  : 'bg-ui/5 border-ui/5 text-ui/70 cursor-default'
              )}
            />
            {editingName ? (
              <div className="flex gap-2">
                <button
                  onClick={saveName}
                  disabled={savingName || !nameValue.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-accent to-accent rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {savingName ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Speichern
                </button>
                <button
                  onClick={() => { setNameValue(initialName); setEditingName(false) }}
                  className="px-3 py-2 glass rounded-xl border border-ui/10 text-sm text-ui/50 hover:text-ui/80"
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl border border-ui/10 text-sm text-ui/50 hover:text-ui/80 transition-colors"
              >
                <Edit2 size={14} />
                Bearbeiten
              </button>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs text-ui/40 font-medium">E-Mail</label>
          <div className="flex gap-2">
            <input
              value={emailValue}
              onChange={e => setEmailValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && editingEmail && saveEmail()}
              disabled={!editingEmail}
              type="email"
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all',
                editingEmail
                  ? 'glass border-accent/40 text-ui focus:outline-none'
                  : 'bg-ui/5 border-ui/5 text-ui/70 cursor-default'
              )}
            />
            {editingEmail ? (
              <div className="flex gap-2">
                <button
                  onClick={saveEmail}
                  disabled={savingEmail || !emailValue.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-accent to-accent rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {savingEmail ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Speichern
                </button>
                <button
                  onClick={() => { setEmailValue(email); setEditingEmail(false) }}
                  className="px-3 py-2 glass rounded-xl border border-ui/10 text-sm text-ui/50 hover:text-ui/80"
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingEmail(true)}
                className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl border border-ui/10 text-sm text-ui/50 hover:text-ui/80 transition-colors"
              >
                <Edit2 size={14} />
                Bearbeiten
              </button>
            )}
          </div>
          {editingEmail && (
            <p className="text-xs text-accent/80 flex items-center gap-1.5 pt-1">
              <Mail size={11} />
              Du erhältst eine Bestätigungs-E-Mail an deine aktuelle Adresse. Erst nach dem Klick auf den Link wird die Adresse geändert.
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-ui/5"
        >
          <h2 className="font-bold flex items-center gap-2 text-ui/80 mb-4">
            <BarChart3 size={18} className="text-accent" />
            Meine Statistiken
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Level', value: stats.level, sub: getLevelTitle(stats.level), icon: Crown, color: 'text-accent' },
              { label: 'XP', value: stats.xp.toLocaleString('de'), sub: 'Erfahrungspunkte', icon: Zap, color: 'text-accent' },
              { label: 'Streak', value: `${stats.streak}`, sub: 'Tage in Folge', icon: Flame, color: 'text-orange-400' },
              { label: 'Tests', value: stats.total_tests, sub: 'Abgeschlossen', icon: Target, color: 'text-emerald-400' },
              { label: 'Durchschnitt', value: `${Math.round(stats.average_score)}%`, sub: 'Aller Tests', icon: BarChart3, color: getScoreColor(stats.average_score) },
              { label: 'Bestes Ergebnis', value: `${Math.round(stats.best_score)}%`, sub: 'Simulationstest', icon: Trophy, color: getScoreColor(stats.best_score) },
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
      )}

      {/* Groups with members */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-strong rounded-3xl p-6 border border-ui/10 space-y-4"
      >
        <h2 className="font-bold flex items-center gap-2 text-ui/80">
          <Users size={18} className="text-accent" />
          Meine Gruppen
          {groups.length > 0 && (
            <span className="text-xs font-mono text-ui/30">({groups.length})</span>
          )}
        </h2>

        {loadingFavorites ? (
          <div className="flex items-center gap-2 text-ui/30 text-sm py-4">
            <Loader2 size={14} className="animate-spin" />
            Lade Gruppen...
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Users size={32} className="mx-auto text-ui/10" />
            <p className="text-ui/30 text-sm">Noch keiner Gruppe beigetreten</p>
            <Link href="/leaderboard" className="text-xs text-accent hover:text-accent transition-colors">
              Gruppe beitreten →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map(g => {
              const isExpanded = expandedGroupId === g.id
              const isLoadingThis = loadingGroupMembers === g.id
              const members = groupMembersCache.get(g.id) ?? []

              return (
                <div key={g.id} className="glass rounded-2xl border border-ui/5 overflow-hidden">
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroupMembers(g.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-ui/5 transition-colors text-left"
                  >
                    <div>
                      <div className="font-semibold text-sm">{g.name}</div>
                      <div className="text-xs font-mono text-ui/25 mt-0.5">{g.id}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isLoadingThis
                        ? <Loader2 size={14} className="animate-spin text-ui/30" />
                        : isExpanded
                          ? <ChevronUp size={14} className="text-ui/40" />
                          : <ChevronDown size={14} className="text-ui/40" />
                      }
                    </div>
                  </button>

                  {/* Members */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-ui/5 px-3 pb-3 pt-2 space-y-1.5">
                          {members.length === 0 ? (
                            <p className="text-xs text-ui/30 text-center py-3">
                              Noch keine Mitglieder mit Tests
                            </p>
                          ) : (
                            members.map(member => (
                              <div
                                key={member.userId}
                                onClick={() => member.isMe ? router.push('/profile') : router.push(`/profile/${member.userId}`)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl glass border border-ui/5 cursor-pointer hover:border-accent/20 transition-all"
                              >
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-accent/20 border border-accent/15 flex items-center justify-center text-xs font-black text-accent/70 shrink-0">
                                  {member.name[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold truncate">{member.name}</span>
                                    {member.isMe && (
                                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent/20 text-accent/70 border border-accent/25 shrink-0">Du</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-ui/35 mt-0.5">
                                    <span className="flex items-center gap-0.5">
                                      <Crown size={9} className="text-accent" /> Lv.{member.level}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <Zap size={9} className="text-accent" /> {member.xp} XP
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <Flame size={9} className="text-orange-400" /> {member.streak}
                                    </span>
                                  </div>
                                </div>
                                {!member.isMe && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(member.userId) }}
                                    disabled={togglingFav === member.userId}
                                    title={favoriteIds.includes(member.userId) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                                    className={cn(
                                      'p-1.5 rounded-lg transition-all shrink-0',
                                      favoriteIds.includes(member.userId)
                                        ? 'text-accent bg-accent/10'
                                        : 'text-ui/20 hover:text-accent hover:bg-accent/10'
                                    )}
                                  >
                                    {togglingFav === member.userId
                                      ? <Loader2 size={13} className="animate-spin" />
                                      : <Star size={13} fill={favoriteIds.includes(member.userId) ? 'currentColor' : 'none'} />
                                    }
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                          <Link
                            href="/leaderboard"
                            className="block text-center text-xs text-accent hover:text-accent transition-colors pt-1"
                          >
                            Vollständiges Leaderboard →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Favorites */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-3xl p-6 border border-ui/10 space-y-4"
      >
        <h2 className="font-bold flex items-center gap-2 text-ui/80">
          <Star size={18} className="text-accent" />
          Favoriten
          {favorites.length > 0 && (
            <span className="text-xs font-mono text-ui/30">({favorites.length})</span>
          )}
        </h2>

        {loadingFavorites ? (
          <div className="flex items-center gap-2 text-ui/30 text-sm py-4">
            <Loader2 size={14} className="animate-spin" />
            Lade Favoriten...
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Star size={36} className="mx-auto text-ui/10" />
            <p className="text-ui/30 text-sm font-medium">Noch keine Favoriten</p>
            <p className="text-ui/20 text-xs">
              Klicke bei einem Gruppenmitglied auf ★ um es zu favorisieren
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map(fav => {
              const details = detailsCache.get(fav.userId)
              const isExpanded = expandedFavId === fav.userId
              const isLoadingThis = loadingDetails === fav.userId

              return (
                <div key={fav.userId} className="glass rounded-2xl border border-ui/5 overflow-hidden">
                  {/* Favorite header */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/20 border border-accent/20 flex items-center justify-center text-sm font-black text-accent/70 shrink-0">
                      {fav.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{fav.name}</div>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-ui/40 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Crown size={10} className="text-accent" /> Lv.{fav.level}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Zap size={10} className="text-accent" /> {fav.xp} XP
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Flame size={10} className="text-orange-400" /> {fav.streak}
                        </span>
                        {fav.best_score > 0 && (
                          <span className={getScoreColor(fav.best_score)}>
                            Best: {Math.round(fav.best_score)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleFavDetails(fav.userId)}
                        className="flex items-center gap-1 px-3 py-1.5 glass rounded-lg border border-ui/10 text-xs text-ui/50 hover:text-ui/80 transition-colors"
                      >
                        {isLoadingThis
                          ? <Loader2 size={12} className="animate-spin" />
                          : isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        }
                        Details
                      </button>
                      <button
                        onClick={() => toggleFavorite(fav.userId)}
                        disabled={togglingFav === fav.userId}
                        className="p-1.5 rounded-lg text-accent hover:text-ui/40 hover:bg-ui/5 transition-all"
                        title="Aus Favoriten entfernen"
                      >
                        {togglingFav === fav.userId
                          ? <Loader2 size={13} className="animate-spin" />
                          : <X size={13} />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && details && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-ui/5 space-y-3 pt-3">
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: 'Ø Score', value: `${Math.round(details.stats?.average_score ?? 0)}%`, color: getScoreColor(details.stats?.average_score ?? 0) },
                              { label: 'Bestes', value: `${Math.round(details.stats?.best_score ?? 0)}%`, color: getScoreColor(details.stats?.best_score ?? 0) },
                              { label: 'Tests', value: details.stats?.total_tests ?? 0, color: 'text-accent' },
                            ].map(({ label, value, color }) => (
                              <div key={label} className="glass rounded-lg p-2.5 border border-ui/5 text-center">
                                <div className={cn('text-sm font-black', color)}>{value}</div>
                                <div className="text-xs text-ui/30">{label}</div>
                              </div>
                            ))}
                          </div>

                          {details.sessions.length > 0 ? (
                            <div className="space-y-1.5">
                              <div className="text-xs text-ui/30 font-medium pt-1">Letzte Tests</div>
                              {details.sessions.slice(0, 5).map(s => (
                                <div
                                  key={s.id}
                                  className="flex items-center gap-3 px-3 py-2 glass rounded-lg border border-ui/5 text-xs"
                                >
                                  <div className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0',
                                    s.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                                    s.percentage >= 60 ? 'bg-accent/15 text-accent' :
                                    'bg-rose-500/15 text-rose-400'
                                  )}>
                                    {Math.round(s.percentage)}%
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-ui/70">
                                      {s.mode === 'simulation' ? 'Simulationstest' : 'Lernmodus'}
                                      <span className="text-ui/30 ml-1">· {s.questions_count} Fragen</span>
                                    </div>
                                    <div className="text-ui/30">
                                      {formatRelativeDate(s.completed_at)} · +{s.xp_earned} XP
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-ui/30 text-center py-2">
                              Noch keine Tests absolviert
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-strong rounded-3xl p-6 border border-ui/10 space-y-5"
      >
        <h2 className="font-bold flex items-center gap-2 text-ui/80">
          <Settings size={18} className="text-accent" />
          Einstellungen
        </h2>

        <div className="space-y-3">
          <label className="text-xs text-ui/40 font-medium">Design & Farbe</label>

          {/* Top-level: Dunkel | Hell | Farbig */}
          <div className="grid grid-cols-3 gap-2">
            {([
              { top: 'dark'  as const, icon: Moon,    label: 'Dunkel' },
              { top: 'light' as const, icon: Sun,     label: 'Hell'   },
              { top: 'color' as const, icon: Palette, label: 'Farbig' },
            ]).map(({ top, icon: Icon, label }) => {
              const active = top === 'color'
                ? colorMode === 'color-dark' || colorMode === 'color-light'
                : colorMode === top
              return (
                <button
                  key={top}
                  onClick={() => handleTopMode(top)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                    active
                      ? 'bg-accent/12 border-accent/30 text-accent'
                      : 'glass border-ui/8 text-ui/50 hover:text-ui/80 hover:border-ui/15'
                  )}
                >
                  <Icon size={18} />
                  <span className="text-xs font-medium">{label}</span>
                  {active && <div className="w-1 h-1 rounded-full bg-accent" />}
                </button>
              )
            })}
          </div>

          {/* Color sub-panel */}
          <AnimatePresence>
            {(colorMode === 'color-dark' || colorMode === 'color-light') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-4">
                  {/* Dark / Light sub-toggle for color mode */}
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { mode: 'color-dark'  as const, icon: Moon, label: 'Dunkel' },
                      { mode: 'color-light' as const, icon: Sun,  label: 'Hell'   },
                    ]).map(({ mode, icon: Icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => handleColorMode(mode)}
                        className={cn(
                          'flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-medium',
                          colorMode === mode
                            ? 'bg-accent/12 border-accent/30 text-accent'
                            : 'glass border-ui/8 text-ui/50 hover:text-ui/80 hover:border-ui/15'
                        )}
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* 2D color picker */}
                  <ColorPicker value={accentColor} onChange={handleAccentChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bottom spacer for mobile */}
      <div className="h-4" />
    </div>
  )
}

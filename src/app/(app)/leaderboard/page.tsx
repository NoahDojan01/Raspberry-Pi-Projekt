'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Users, Plus, X, Loader2, Crown,
  Flame, Star, Target, Copy, Check, Pencil, AlertTriangle, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/helpers'

interface Group { id: string; name: string }
interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  xp: number
  level: number
  streak: number
  totalTests: number
  bestScore: number
  isMe: boolean
}

const GROUP_ID_REGEX = /^[A-Za-z0-9]{8}$/

function MigrationBanner({ title, sql }: { title: string; sql: string }) {
  const [copied, setCopied] = useState(false)

  function copySQL() {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-amber-500/30 bg-amber-500/5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-amber-300">Datenbank-Migration erforderlich</h3>
          <p className="text-sm text-white/60 mt-1">
            {title} Öffne den <strong className="text-white/80">Supabase SQL Editor</strong> und führe
            folgenden Code aus:
          </p>
        </div>
      </div>
      <div className="relative">
        <pre className="text-xs text-emerald-300 bg-black/40 rounded-xl p-4 overflow-x-auto border border-white/10 leading-relaxed">
          {sql}
        </pre>
        <button
          onClick={copySQL}
          className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg border border-white/10 text-xs text-white/50 hover:text-white/80 transition-all"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Kopiert!' : 'Kopieren'}
        </button>
      </div>
      <p className="text-xs text-white/40">
        Danach einmal die Seite neu laden.
      </p>
    </motion.div>
  )
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [loadingBoard, setLoadingBoard] = useState(false)
  const [migrationError, setMigrationError] = useState<{ title: string; sql: string } | null>(null)

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [togglingFav, setTogglingFav] = useState<string | null>(null)

  // Join form
  const [joinId, setJoinId] = useState('')
  const [joinName, setJoinName] = useState('')
  // 'idle' = show form; 'needsName' = new group, waiting for name; 'joining' = loading
  const [joinStep, setJoinStep] = useState<'idle' | 'needsName' | 'joining'>('idle')
  const [showForm, setShowForm] = useState(false)

  // Rename
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Copy
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/groups').then(r => r.json()),
      fetch('/api/favorites').then(r => r.json()),
    ]).then(([groupData, favData]) => {
      if (groupData.error === 'migration_needed') {
        setMigrationError({
          title: 'Die Gruppen-Spalten fehlen noch in der Datenbank.',
          sql: groupData.sql,
        })
      } else if (groupData.error === 'groups_table_missing' || groupData.needsGroupsTableMigration) {
        setMigrationError({
          title: 'Die gemeinsame Gruppen-Tabelle fehlt noch.',
          sql: groupData.sql,
        })
        const list: Group[] = groupData.groups ?? []
        setGroups(list)
        if (list.length) setSelectedId(list[0].id)
      } else {
        const list: Group[] = groupData.groups ?? []
        setGroups(list)
        if (list.length) setSelectedId(list[0].id)
      }
      setFavoriteIds(favData.favoriteIds ?? [])
    }).finally(() => setLoadingGroups(false))
  }, [])

  const fetchLeaderboard = useCallback(async (groupId: string) => {
    setLoadingBoard(true)
    try {
      const res = await fetch(`/api/leaderboard?groupId=${groupId}`)
      const { entries: data } = await res.json()
      setEntries(data ?? [])
    } finally {
      setLoadingBoard(false)
    }
  }, [])

  useEffect(() => {
    if (selectedId) fetchLeaderboard(selectedId)
  }, [selectedId, fetchLeaderboard])

  function resetJoinForm() {
    setJoinId('')
    setJoinName('')
    setJoinStep('idle')
    setShowForm(false)
  }

  async function submitJoin() {
    const id = joinId.trim().toUpperCase()
    if (!GROUP_ID_REGEX.test(id)) {
      toast.error('ID muss genau 8 Buchstaben oder Zahlen sein')
      return
    }

    // In needsName step: name is required
    if (joinStep === 'needsName' && !joinName.trim()) {
      toast.error('Bitte einen Gruppennamen eingeben')
      return
    }

    setJoinStep('joining')

    const body: Record<string, string> = { groupId: id }
    if (joinStep === 'needsName') body.name = joinName.trim()

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      if (data.error === 'migration_needed') {
        setMigrationError({ title: 'Die Gruppen-Spalten fehlen noch.', sql: data.sql })
      } else if (data.error === 'groups_table_missing') {
        setMigrationError({ title: 'Die gemeinsame Gruppen-Tabelle fehlt noch.', sql: data.sql })
      } else {
        toast.error(data.error)
      }
      setJoinStep(joinStep === 'needsName' ? 'needsName' : 'idle')
      return
    }

    if (data.needsName) {
      // New group: ask for a name
      setJoinStep('needsName')
      return
    }

    // Successfully joined
    setGroups(data.groups)
    setSelectedId(id)
    toast.success(`Gruppe "${data.joinedName}" beigetreten!`)
    resetJoinForm()
  }

  async function renameGroup(id: string) {
    if (!editName.trim()) return
    const res = await fetch('/api/groups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: id, name: editName.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Fehler beim Umbenennen')
    } else {
      setGroups(data.groups)
      setEditingId(null)
      toast.success('Gruppenname aktualisiert')
    }
  }

  async function removeGroup(id: string) {
    const res = await fetch('/api/groups', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: id }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Fehler beim Verlassen')
    } else {
      setGroups(data.groups)
      if (selectedId === id) {
        setSelectedId(data.groups[0]?.id ?? null)
        setEntries([])
      }
      toast.success('Gruppe verlassen')
    }
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
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
      setFavoriteIds(data.favoriteIds ?? [])
      toast.success(isFav ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt')
    } else {
      toast.error(data.message ?? data.error ?? 'Fehler')
    }
    setTogglingFav(null)
  }

  const selectedGroup = groups.find((g) => g.id === selectedId)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Trophy className="text-violet-400" />
          Leaderboard
        </h1>
        <p className="text-white/50 mt-1">
          Teile eine Gruppen-ID mit Freunden und vergleiche eure Ergebnisse
        </p>
      </div>

      {/* Migration Banner */}
      {migrationError && (
        <MigrationBanner title={migrationError.title} sql={migrationError.sql} />
      )}

      {/* Group management card */}
      <div className="glass-strong rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-white/80">
            <Users size={18} className="text-violet-400" />
            Meine Gruppen
          </h2>
          <button
            onClick={() => { setShowForm((v) => !v); setJoinStep('idle'); setJoinId(''); setJoinName('') }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition-all',
              showForm
                ? 'bg-white/10 border-white/20 text-white/60'
                : 'bg-violet-500/15 border-violet-500/30 text-violet-300 hover:bg-violet-500/20'
            )}
          >
            <Plus size={14} />
            Gruppe beitreten
          </button>
        </div>

        {/* Join form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Step 1: enter ID */}
              <div>
                <label className="block text-xs text-white/40 mb-1.5">
                  Gruppen-ID (8 Zeichen)
                </label>
                <div className="flex gap-2">
                  <input
                    value={joinId}
                    onChange={(e) => {
                      setJoinId(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8))
                      if (joinStep === 'needsName') setJoinStep('idle')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && joinStep !== 'needsName' && submitJoin()}
                    placeholder="z.B. FECG2025"
                    maxLength={8}
                    disabled={joinStep === 'joining'}
                    className="flex-1 px-3 py-2.5 glass rounded-xl border border-white/10 text-white placeholder-white/25 focus:border-violet-500/50 focus:outline-none text-sm font-mono tracking-widest uppercase disabled:opacity-50"
                  />
                  {joinStep !== 'needsName' && (
                    <motion.button
                      onClick={submitJoin}
                      disabled={joinStep === 'joining' || joinId.length !== 8}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {joinStep === 'joining'
                        ? <Loader2 size={15} className="animate-spin" />
                        : <ArrowRight size={15} />
                      }
                      Prüfen
                    </motion.button>
                  )}
                </div>
                <p className="text-xs text-white/30 mt-1.5">
                  Alle, die dieselbe ID eingeben, sehen sich gegenseitig im Leaderboard.
                </p>
              </div>

              {/* Step 2: name input (only for new groups) */}
              <AnimatePresence>
                {joinStep === 'needsName' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
                      <Star size={14} className="shrink-0" />
                      Neue Gruppe! Du bist der Erste – gib ihr einen Namen:
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Gruppenname</label>
                      <input
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitJoin()}
                        placeholder="z.B. Jugendrüstzeit 2025"
                        autoFocus
                        className="w-full px-3 py-2.5 glass rounded-xl border border-white/10 text-white placeholder-white/25 focus:border-violet-500/50 focus:outline-none text-sm"
                      />
                    </div>
                    <p className="text-xs text-white/30">
                      Dieser Name ist für alle sichtbar, die derselben Gruppe beitreten.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2">
                {joinStep === 'needsName' && (
                  <motion.button
                    onClick={submitJoin}
                    disabled={!joinName.trim()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={15} />
                    Gruppe erstellen & beitreten
                  </motion.button>
                )}
                <button
                  onClick={resetJoinForm}
                  className="px-4 py-2.5 glass rounded-xl border border-white/10 text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group list */}
        {loadingGroups ? (
          <div className="flex items-center gap-2 text-white/30 text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Lade Gruppen...
          </div>
        ) : groups.length === 0 ? (
          <p className="text-white/30 text-sm py-1">Noch keiner Gruppe beigetreten.</p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedId(g.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all',
                  selectedId === g.id
                    ? 'bg-violet-500/15 border-violet-500/30'
                    : 'glass border-white/5 hover:border-white/15'
                )}
              >
                {editingId === g.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') renameGroup(g.id); if (e.key === 'Escape') setEditingId(null) }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="flex-1 bg-transparent border-b border-violet-500/50 text-white text-sm focus:outline-none py-0.5"
                  />
                ) : (
                  <span className={cn('flex-1 font-semibold text-sm', selectedId === g.id ? 'text-violet-200' : 'text-white/70')}>
                    {g.name}
                  </span>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs font-mono text-white/25 mr-1">{g.id}</span>

                  <button
                    onClick={(e) => { e.stopPropagation(); copyId(g.id) }}
                    className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
                    title="ID kopieren"
                  >
                    {copied === g.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingId(g.id); setEditName(g.name) }}
                    className="p-1.5 rounded-lg text-white/25 hover:text-violet-400 hover:bg-white/5 transition-all"
                    title="Umbenennen (für alle sichtbar)"
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); removeGroup(g.id) }}
                    className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Gruppe verlassen"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      {selectedId && selectedGroup && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Trophy size={20} className="text-amber-400" />
              {selectedGroup.name}
              <span className="text-xs font-mono text-white/25 font-normal">{selectedId}</span>
            </h2>
            <button
              onClick={() => fetchLeaderboard(selectedId)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Aktualisieren
            </button>
          </div>

          {loadingBoard ? (
            <div className="flex items-center justify-center py-16 text-white/30">
              <Loader2 size={28} className="animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="glass rounded-2xl p-10 border border-white/5 text-center space-y-2">
              <Users size={36} className="mx-auto mb-3 text-white/20" />
              <p className="font-semibold text-white/50">Noch niemand beigetreten</p>
              <p className="text-sm text-white/30">
                Teile die ID <span className="font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg">{selectedId}</span> mit deinen Freunden!
              </p>
              <p className="text-xs text-white/20 pt-1">
                Du erscheinst hier sobald du deinen ersten Test abgeschlossen hast.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => router.push(entry.isMe ? '/profile' : `/profile/${entry.userId}`)}
                  className={cn(
                    'glass rounded-2xl p-4 border flex items-center gap-4 transition-all cursor-pointer hover:border-violet-500/30',
                    entry.isMe ? 'border-violet-500/30 bg-violet-500/5' :
                    entry.rank <= 3 ? 'border-amber-500/15' : 'border-white/5'
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0',
                    entry.rank === 1 ? 'bg-amber-500/20 text-amber-400 text-lg' :
                    entry.rank === 2 ? 'bg-slate-400/15 text-slate-300 text-lg' :
                    entry.rank === 3 ? 'bg-orange-700/15 text-orange-400 text-lg' :
                    'bg-white/5 text-white/40 text-sm'
                  )}>
                    {entry.rank <= 3 ? <Crown size={18} /> : `#${entry.rank}`}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-bold truncate', entry.isMe ? 'text-violet-300' : 'text-white')}>
                        {entry.name}
                      </span>
                      {entry.isMe && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                          Du
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Target size={11} />
                        {entry.totalTests} Tests
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame size={11} className="text-amber-400" />
                        {entry.streak}
                      </span>
                      {entry.bestScore > 0 && (
                        <span>Best: {Math.round(entry.bestScore)}%</span>
                      )}
                    </div>
                  </div>

                  {/* XP + Favorite */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-black text-violet-400 flex items-center gap-1 justify-end">
                        <Star size={14} />
                        {entry.xp} XP
                      </div>
                      <div className="text-xs text-white/40">Level {entry.level}</div>
                    </div>
                    {!entry.isMe && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(entry.userId) }}
                        disabled={togglingFav === entry.userId}
                        title={favoriteIds.includes(entry.userId) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                        className={cn(
                          'p-2 rounded-xl transition-all',
                          favoriteIds.includes(entry.userId)
                            ? 'text-amber-400 hover:text-amber-300 bg-amber-500/10'
                            : 'text-white/20 hover:text-amber-400 hover:bg-amber-500/10'
                        )}
                      >
                        {togglingFav === entry.userId
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Star size={15} fill={favoriteIds.includes(entry.userId) ? 'currentColor' : 'none'} />
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {!selectedId && !loadingGroups && groups.length === 0 && (
        <div className="glass rounded-2xl p-10 border border-white/5 text-center text-white/30 space-y-2">
          <Trophy size={40} className="mx-auto opacity-30" />
          <p className="font-semibold">Tritt einer Gruppe bei</p>
          <p className="text-sm">Klick auf "Gruppe beitreten" und gib eine ID ein, die du dir mit Freunden teilst</p>
        </div>
      )}
    </div>
  )
}

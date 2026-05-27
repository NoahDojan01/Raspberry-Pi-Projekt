'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, Check, X, Plus, Trash2, Users, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/helpers'
import { QUESTIONS } from '@/data/questions'

interface Dispute {
  id: string
  question_id: number
  user_id: string
  user_answer: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  resolved_at: string | null
  userName: string
}

interface Variant {
  id: string
  question_id: number
  variant_text: string
  dispute_id: string | null
  created_at: string
}

interface UserToggle {
  id: string
  name: string
  featureEnabled: boolean
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt',
}

export default function AdminDisputesClient({
  initialDisputes,
  initialVariants,
  usersForToggle: initialUsers,
}: {
  initialDisputes: Dispute[]
  initialVariants: Variant[]
  usersForToggle: UserToggle[]
}) {
  const [disputes, setDisputes] = useState(initialDisputes)
  const [variants, setVariants] = useState(initialVariants)
  const [users, setUsers] = useState(initialUsers)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [acting, setActing] = useState<string | null>(null)
  const [newVariantText, setNewVariantText] = useState<Record<number, string>>({})
  const [addingVariant, setAddingVariant] = useState<number | null>(null)
  const [showVariants, setShowVariants] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [togglingUser, setTogglingUser] = useState<string | null>(null)
  // For adding a variant to any question
  const [quickAddQId, setQuickAddQId] = useState<number>(QUESTIONS[0]?.id ?? 1)
  const [quickAddText, setQuickAddText] = useState('')
  const [quickAdding, setQuickAdding] = useState(false)

  const filtered = disputes.filter(d => d.status === filter)
  const pendingCount = disputes.filter(d => d.status === 'pending').length

  const variantsByQuestion = useMemo(() => {
    const map: Record<number, Variant[]> = {}
    variants.forEach(v => {
      if (!map[v.question_id]) map[v.question_id] = []
      map[v.question_id].push(v)
    })
    return map
  }, [variants])

  const questionIdsWithVariants = Object.keys(variantsByQuestion).map(Number)

  async function quickAddVariant() {
    const text = quickAddText.trim()
    if (!text || !quickAddQId) return
    setQuickAdding(true)
    try {
      const res = await fetch('/api/admin/answer-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: quickAddQId, variantText: text }),
      })
      if (!res.ok) throw new Error()
      setVariants(prev => [...prev, {
        id: `temp-${Date.now()}`,
        question_id: quickAddQId,
        variant_text: text,
        dispute_id: null,
        created_at: new Date().toISOString(),
      }])
      setQuickAddText('')
      toast.success('100%-Antwort hinzugefügt')
    } catch {
      toast.error('Fehler beim Hinzufügen')
    } finally {
      setQuickAdding(false)
    }
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActing(id)
    try {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      const dispute = disputes.find(d => d.id === id)
      setDisputes(prev => prev.map(d =>
        d.id === id ? { ...d, status: action === 'approve' ? 'approved' : 'rejected', resolved_at: new Date().toISOString() } : d
      ))
      if (action === 'approve' && dispute) {
        setVariants(prev => [...prev, {
          id: `temp-${Date.now()}`,
          question_id: dispute.question_id,
          variant_text: dispute.user_answer,
          dispute_id: id,
          created_at: new Date().toISOString(),
        }])
      }
      toast.success(action === 'approve' ? 'Antwort genehmigt' : 'Einspruch abgelehnt')
    } catch {
      toast.error('Fehler')
    } finally {
      setActing(null)
    }
  }

  async function addVariant(questionId: number) {
    const text = newVariantText[questionId]?.trim()
    if (!text) return
    setAddingVariant(questionId)
    try {
      const res = await fetch('/api/admin/answer-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, variantText: text }),
      })
      if (!res.ok) throw new Error()
      setVariants(prev => [...prev, {
        id: `temp-${Date.now()}`,
        question_id: questionId,
        variant_text: text,
        dispute_id: null,
        created_at: new Date().toISOString(),
      }])
      setNewVariantText(prev => ({ ...prev, [questionId]: '' }))
      toast.success('Variante hinzugefügt')
    } catch {
      toast.error('Fehler')
    } finally {
      setAddingVariant(null)
    }
  }

  async function deleteVariant(id: string) {
    try {
      const res = await fetch(`/api/admin/answer-variants/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setVariants(prev => prev.filter(v => v.id !== id))
      toast.success('Variante entfernt')
    } catch {
      toast.error('Fehler')
    }
  }

  async function toggleUserFeature(userId: string, currentEnabled: boolean) {
    setTogglingUser(userId)
    try {
      const res = await fetch('/api/admin/users/dispute-feature', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled: !currentEnabled }),
      })
      if (!res.ok) throw new Error()
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, featureEnabled: !currentEnabled } : u))
      toast.success(!currentEnabled ? 'Funktion aktiviert' : 'Funktion deaktiviert')
    } catch {
      toast.error('Fehler')
    } finally {
      setTogglingUser(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
          <ThumbsUp size={18} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            Antworten
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-sm font-bold border border-amber-500/25">
                {pendingCount} offen
              </span>
            )}
          </h1>
          <p className="text-ui/40 text-sm">Einsprüche prüfen · Alternative Antworten verwalten</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-xl overflow-hidden border border-ui/8 glass text-sm w-fit">
        {(['pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-2.5 transition-colors font-medium',
              filter === s ? 'bg-accent/15 text-accent' : 'text-ui/60 hover:text-ui/85'
            )}
          >
            {STATUS_LABELS[s]}
            <span className="ml-1.5 text-xs opacity-60">({disputes.filter(d => d.status === s).length})</span>
          </button>
        ))}
      </div>

      {/* Disputes list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 border border-ui/5 text-center text-ui/30 text-sm"
            >
              Keine {STATUS_LABELS[filter].toLowerCase()} Einsprüche
            </motion.div>
          ) : (
            filtered.map(d => {
              const q = QUESTIONS.find(q => q.id === d.question_id)
              return (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="glass rounded-2xl p-5 border border-ui/5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-ui/35 mb-1">
                        <span className="font-mono">#{d.question_id}</span> · {q?.category ?? '—'} · von <span className="text-ui/60">{d.userName}</span>
                        <span className="ml-2 text-ui/25">{new Date(d.created_at).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div className="text-sm font-medium text-ui/80 mb-2">{q?.question ?? `Frage ID ${d.question_id}`}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="glass rounded-xl p-3 border border-ui/8">
                          <div className="text-ui/35 mb-1 font-medium">Erwartete Antwort</div>
                          <div className="text-ui/65 leading-relaxed">{q?.answer ?? '—'}</div>
                        </div>
                        <div className={cn(
                          'rounded-xl p-3 border',
                          d.status === 'approved'
                            ? 'bg-emerald-500/8 border-emerald-500/20'
                            : d.status === 'rejected'
                            ? 'bg-rose-500/8 border-rose-500/20'
                            : 'glass border-accent/15'
                        )}>
                          <div className="text-ui/35 mb-1 font-medium">Antwort des Nutzers</div>
                          <div className="text-ui/80 font-medium leading-relaxed">{d.user_answer}</div>
                        </div>
                      </div>
                    </div>

                    {d.status === 'pending' && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(d.id, 'approve')}
                          disabled={acting === d.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                        >
                          <Check size={13} />
                          Genehmigen
                        </button>
                        <button
                          onClick={() => handleAction(d.id, 'reject')}
                          disabled={acting === d.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-500/20 text-rose-400 border border-rose-500/35 hover:bg-rose-500/30 transition-colors disabled:opacity-50"
                        >
                          <X size={13} />
                          Ablehnen
                        </button>
                      </div>
                    )}

                    {d.status !== 'pending' && (
                      <span className={cn(
                        'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border',
                        d.status === 'approved'
                          ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25'
                          : 'bg-rose-500/12 text-rose-400 border-rose-500/25'
                      )}>
                        {d.status === 'approved' ? '✓ Genehmigt' : '✗ Abgelehnt'}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Approved variants section */}
      <div className="glass rounded-2xl border border-ui/5 overflow-hidden">
        <button
          onClick={() => setShowVariants(v => !v)}
          className="w-full flex items-center justify-between p-5 hover:bg-ui/3 transition-colors"
        >
          <div className="font-semibold flex items-center gap-2">
            <Check size={16} className="text-emerald-400" />
            Akzeptierte alternative Antworten
            <span className="text-xs text-ui/35 font-mono">({variants.length})</span>
          </div>
          {showVariants ? <ChevronUp size={16} className="text-ui/40" /> : <ChevronDown size={16} className="text-ui/40" />}
        </button>

        <AnimatePresence>
          {showVariants && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-ui/5 p-5 space-y-6">
                {/* Quick-add: variant for any question */}
                <div className="glass rounded-xl p-4 border border-accent/15 space-y-3">
                  <div className="text-xs font-medium text-ui/60">100%-Antwort für beliebige Frage hinzufügen</div>
                  <select
                    value={quickAddQId}
                    onChange={e => setQuickAddQId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-ui/8 text-xs bg-surface focus:outline-none focus:border-accent/30"
                  >
                    {QUESTIONS.map(q => (
                      <option key={q.id} value={q.id}>{q.id}. {q.question.slice(0, 80)}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Alternative Antwort, die 100% geben soll..."
                      value={quickAddText}
                      onChange={e => setQuickAddText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && quickAddVariant()}
                      className="flex-1 px-3 py-2 glass rounded-lg border border-ui/8 text-xs bg-transparent placeholder:text-ui/25 focus:outline-none focus:border-accent/30"
                    />
                    <button
                      onClick={quickAddVariant}
                      disabled={!quickAddText.trim() || quickAdding}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 disabled:opacity-50 transition-colors"
                    >
                      <Plus size={13} />
                      {quickAdding ? '…' : 'Hinzufügen'}
                    </button>
                  </div>
                </div>

                {/* Manual add for a question */}
                <div className="space-y-2">
                  <div className="text-xs text-ui/40 font-medium">Variante manuell für Frage hinzufügen</div>
                  {questionIdsWithVariants.concat(
                    disputes.filter(d => d.status === 'approved').map(d => d.question_id).filter(id => !questionIdsWithVariants.includes(id))
                  ).filter((id, i, arr) => arr.indexOf(id) === i).map(qId => {
                    const q = QUESTIONS.find(q => q.id === qId)
                    const qVariants = variantsByQuestion[qId] ?? []
                    return (
                      <div key={qId} className="glass rounded-xl p-4 border border-ui/5 space-y-3">
                        <div className="text-xs font-medium text-ui/60">
                          <span className="font-mono text-ui/35">#{qId}</span> {q?.question ?? `Frage ${qId}`}
                        </div>
                        <div className="space-y-1.5">
                          {qVariants.map(v => (
                            <div key={v.id} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/8 rounded-lg border border-emerald-500/15">
                              <span className="text-xs text-emerald-400/80 flex-1">{v.variant_text}</span>
                              {v.dispute_id && <span className="text-[10px] text-ui/25 shrink-0">via Einspruch</span>}
                              <button
                                onClick={() => deleteVariant(v.id)}
                                className="text-ui/25 hover:text-rose-400 transition-colors shrink-0"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Neue alternative Antwort..."
                            value={newVariantText[qId] ?? ''}
                            onChange={e => setNewVariantText(prev => ({ ...prev, [qId]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addVariant(qId)}
                            className="flex-1 px-3 py-2 glass rounded-lg border border-ui/8 text-xs bg-transparent placeholder:text-ui/25 focus:outline-none focus:border-accent/30"
                          />
                          <button
                            onClick={() => addVariant(qId)}
                            disabled={!newVariantText[qId]?.trim() || addingVariant === qId}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/35 hover:bg-accent/30 disabled:opacity-50 transition-colors"
                          >
                            <Plus size={13} />
                            Hinzufügen
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {questionIdsWithVariants.length === 0 && disputes.filter(d => d.status === 'approved').length === 0 && (
                    <div className="text-xs text-ui/30 text-center py-4">
                      Noch keine genehmigten Antworten oder manuellen Varianten
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User feature toggle section */}
      <div className="glass rounded-2xl border border-ui/5 overflow-hidden">
        <button
          onClick={() => setShowUsers(v => !v)}
          className="w-full flex items-center justify-between p-5 hover:bg-ui/3 transition-colors"
        >
          <div className="font-semibold flex items-center gap-2">
            <Users size={16} className="text-accent" />
            Einspruchs-Funktion pro Nutzer
            {users.filter(u => !u.featureEnabled).length > 0 && (
              <span className="text-xs text-rose-400/70 font-mono">
                ({users.filter(u => !u.featureEnabled).length} deaktiviert)
              </span>
            )}
          </div>
          {showUsers ? <ChevronUp size={16} className="text-ui/40" /> : <ChevronDown size={16} className="text-ui/40" />}
        </button>

        <AnimatePresence>
          {showUsers && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-ui/5 p-5 space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between gap-3 px-3 py-2.5 glass rounded-xl border border-ui/5">
                    <span className="text-sm font-medium">{u.name}</span>
                    <button
                      onClick={() => toggleUserFeature(u.id, u.featureEnabled)}
                      disabled={togglingUser === u.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        u.featureEnabled
                          ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-rose-500/12 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                      )}
                    >
                      {u.featureEnabled
                        ? <><ToggleRight size={14} /> Aktiv</>
                        : <><ToggleLeft size={14} /> Deaktiviert</>
                      }
                    </button>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-xs text-ui/30 text-center py-4">Noch keine Nutzer mit Einsprüchen</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

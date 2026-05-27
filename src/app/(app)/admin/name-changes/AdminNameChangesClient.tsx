'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, Check, X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/helpers'

interface NameChangeRequest {
  id: string
  user_id: string
  old_name: string
  new_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  email: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  approved: 'Genehmigt',
  rejected: 'Abgelehnt',
}

export default function AdminNameChangesClient({
  initialRequests,
}: {
  initialRequests: NameChangeRequest[]
}) {
  const [requests, setRequests] = useState(initialRequests)
  const [acting, setActing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')

  const filtered = requests.filter(r => r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'pending').length

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActing(id)
    try {
      const res = await fetch(`/api/admin/name-changes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      setRequests(prev => prev.map(r =>
        r.id === id
          ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' }
          : r
      ))
      toast.success(action === 'approve' ? 'Name genehmigt' : 'Anfrage abgelehnt')
    } catch {
      toast.error('Fehler')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
          <UserCheck size={18} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            Namensänderungen
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-sm font-bold border border-amber-500/25">
                {pendingCount} offen
              </span>
            )}
          </h1>
          <p className="text-ui/50 text-sm">Namensänderungsanfragen prüfen</p>
        </div>
      </div>

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
            <span className="ml-1.5 text-xs opacity-60">({requests.filter(r => r.status === s).length})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 border border-ui/5 text-center text-ui/30 text-sm"
            >
              Keine {STATUS_LABELS[filter].toLowerCase()} Anfragen
            </motion.div>
          ) : (
            filtered.map(r => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass rounded-2xl p-5 border border-ui/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-ui/35 mb-2">
                      {r.email} · {new Date(r.created_at).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <span className="px-3 py-1.5 glass rounded-xl border border-ui/10 text-ui/70">{r.old_name}</span>
                      <ChevronRight size={14} className="text-ui/30 shrink-0" />
                      <span className={cn(
                        'px-3 py-1.5 rounded-xl border font-semibold',
                        r.status === 'approved'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : r.status === 'rejected'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          : 'bg-accent/10 border-accent/20 text-accent'
                      )}>
                        {r.new_name}
                      </span>
                    </div>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(r.id, 'approve')}
                        disabled={acting === r.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      >
                        <Check size={13} />
                        Genehmigen
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'reject')}
                        disabled={acting === r.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-500/20 text-rose-400 border border-rose-500/35 hover:bg-rose-500/30 transition-colors disabled:opacity-50"
                      >
                        <X size={13} />
                        Ablehnen
                      </button>
                    </div>
                  )}

                  {r.status !== 'pending' && (
                    <span className={cn(
                      'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border',
                      r.status === 'approved'
                        ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25'
                        : 'bg-rose-500/12 text-rose-400 border-rose-500/25'
                    )}>
                      {r.status === 'approved' ? '✓ Genehmigt' : '✗ Abgelehnt'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

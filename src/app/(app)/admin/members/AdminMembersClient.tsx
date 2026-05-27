'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Trash2, Star, Flame, Trophy, ShieldCheck, Shield, ChevronDown, X, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface Member {
  id: string
  name: string
  email: string
  created_at: string
  is_admin: boolean
  isSuperAdmin: boolean
  xp: number
  level: number
  streak: number
  total_tests: number
}

type ConfirmAction =
  | { type: 'promote'; member: Member }
  | { type: 'delete'; member: Member }

export default function AdminMembersClient({
  members: initial,
  isSuperAdmin,
}: {
  members: Member[]
  isSuperAdmin: boolean
}) {
  const [members, setMembers] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [loading, setLoading] = useState(false)

  async function executeConfirm() {
    if (!confirm) return
    setLoading(true)
    try {
      if (confirm.type === 'promote') {
        const promote = !confirm.member.is_admin
        const res = await fetch('/api/admin/users/promote', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: confirm.member.id, promote }),
        })
        if (!res.ok) throw new Error()
        setMembers(m => m.map(u => u.id === confirm.member.id ? { ...u, is_admin: promote } : u))
        toast.success(promote ? `${confirm.member.name} ist jetzt Admin` : `${confirm.member.name} ist kein Admin mehr`)
      } else {
        const res = await fetch(`/api/admin/users?id=${confirm.member.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error()
        setMembers(m => m.filter(u => u.id !== confirm.member.id))
        setExpanded(e => e === confirm.member.id ? null : e)
        toast.success('Nutzer gelöscht')
      }
      setConfirm(null)
    } catch {
      toast.error('Fehler – bitte erneut versuchen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Users size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Mitglieder</h1>
            <p className="text-ui/40 text-sm">{members.length} Nutzer registriert</p>
          </div>
        </div>

        <div className="glass rounded-2xl border border-ui/5 divide-y divide-ui/5">
          {members.map((m) => {
            const isOpen = expanded === m.id
            return (
              <div key={m.id}>
                {/* Main row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : m.id)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-ui/3 transition-colors select-none"
                >
                  {/* Avatar placeholder */}
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-sm font-bold text-accent">
                    {m.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{m.name}</span>
                      {m.isSuperAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold shrink-0">
                          <ShieldCheck size={11} /> Super-Admin
                        </span>
                      )}
                      {!m.isSuperAdmin && m.is_admin && (
                        <span className="inline-flex items-center gap-1 text-xs text-accent font-semibold shrink-0">
                          <Shield size={11} /> Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ui/35 truncate">{m.email}</p>
                  </div>

                  {/* Actions – stop propagation so row click doesn't fire */}
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {isSuperAdmin && !m.isSuperAdmin && (
                      <button
                        onClick={() => setConfirm({ type: 'promote', member: m })}
                        className={`p-1.5 rounded-lg transition-all ${
                          m.is_admin
                            ? 'text-accent bg-accent/10 hover:bg-rose-500/10 hover:text-rose-400'
                            : 'text-ui/25 hover:text-accent hover:bg-accent/10'
                        }`}
                        title={m.is_admin ? 'Admin-Rechte entziehen' : 'Zum Admin ernennen'}
                      >
                        <Shield size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirm({ type: 'delete', member: m })}
                      className="p-1.5 rounded-lg text-ui/25 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      title="Nutzer löschen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-ui/25 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Expanded stats */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 pt-1 grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                          { icon: <Star size={13} className="text-accent" />, label: 'Level', value: m.level },
                          { icon: <Star size={13} className="text-accent" />, label: 'XP', value: m.xp.toLocaleString('de') },
                          { icon: <Flame size={13} className="text-orange-400" />, label: 'Streak', value: m.streak },
                          { icon: <Trophy size={13} className="text-emerald-400" />, label: 'Tests', value: m.total_tests },
                          { icon: <Calendar size={13} className="text-ui/40" />, label: 'Dabei seit', value: new Date(m.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                        ].map(({ icon, label, value }) => (
                          <div key={label} className="glass rounded-xl px-3 py-2">
                            <div className="flex items-center gap-1 text-ui/40 text-xs mb-0.5">{icon}{label}</div>
                            <div className="font-semibold text-sm">{value}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => !loading && setConfirm(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                className="w-full max-w-sm pointer-events-auto"
              >
                <div className="glass-strong rounded-2xl border border-ui/10 p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: confirm.type === 'delete' ? 'rgba(244,63,94,0.15)' : 'rgba(var(--accent-rgb),0.15)' }}
                    >
                      {confirm.type === 'delete'
                        ? <Trash2 size={18} className="text-rose-400" />
                        : <Shield size={18} className="text-accent" />
                      }
                    </div>
                    <button
                      onClick={() => setConfirm(null)}
                      disabled={loading}
                      className="p-1 rounded-lg text-ui/30 hover:text-ui/70 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg leading-tight">
                      {confirm.type === 'delete'
                        ? 'Nutzer löschen?'
                        : confirm.member.is_admin
                          ? 'Admin-Rechte entziehen?'
                          : 'Zum Admin ernennen?'
                      }
                    </h3>
                    <p className="text-ui/50 text-sm mt-1">
                      {confirm.type === 'delete'
                        ? <>Der Account von <strong className="text-ui/80">{confirm.member.name}</strong> wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.</>
                        : confirm.member.is_admin
                          ? <><strong className="text-ui/80">{confirm.member.name}</strong> verliert den Zugang zum Admin-Bereich.</>
                          : <><strong className="text-ui/80">{confirm.member.name}</strong> bekommt vollen Zugang zum Admin-Bereich.</>
                      }
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setConfirm(null)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 rounded-xl glass border border-ui/10 text-sm font-medium hover:bg-ui/5 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={executeConfirm}
                      disabled={loading}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        confirm.type === 'delete'
                          ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/20'
                          : 'btn-accent'
                      }`}
                    >
                      {loading ? '...' : confirm.type === 'delete' ? 'Löschen' : confirm.member.is_admin ? 'Entziehen' : 'Ernennen'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

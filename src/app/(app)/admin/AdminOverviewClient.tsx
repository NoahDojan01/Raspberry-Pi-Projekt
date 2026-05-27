'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Users, MessageSquarePlus, HelpCircle, AlertCircle, CheckSquare, Bell, UserCheck, Wrench } from 'lucide-react'

interface Props {
  totalUsers: number
  totalFeedback: number
  openFeedback: number
  totalSessions: number
  pendingDisputes: number
  pendingNameChanges: number
}

export default function AdminOverviewClient({ totalUsers, totalFeedback, openFeedback, totalSessions, pendingDisputes, pendingNameChanges }: Props) {
  const hasPending = openFeedback > 0 || pendingDisputes > 0 || pendingNameChanges > 0

  const cards = [
    {
      href: '/admin/members',
      icon: Users,
      label: 'Mitglieder',
      value: totalUsers,
      sub: 'Registrierte Nutzer',
      color: 'text-accent bg-accent/10',
    },
    {
      href: '/admin/disputes',
      icon: CheckSquare,
      label: 'Antworten',
      value: pendingDisputes,
      sub: 'Ausstehende Einsprüche',
      color: pendingDisputes > 0 ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10',
      badge: pendingDisputes > 0 ? pendingDisputes : undefined,
    },
    {
      href: '/admin/name-changes',
      icon: UserCheck,
      label: 'Namen',
      value: pendingNameChanges,
      sub: 'Namensänderungen',
      color: pendingNameChanges > 0 ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10',
      badge: pendingNameChanges > 0 ? pendingNameChanges : undefined,
    },
    {
      href: '/admin/feedback',
      icon: MessageSquarePlus,
      label: 'Feedback',
      value: totalFeedback,
      sub: `${openFeedback} offen`,
      color: openFeedback > 0 ? 'text-rose-400 bg-rose-400/10' : 'text-emerald-400 bg-emerald-400/10',
      badge: openFeedback > 0 ? openFeedback : undefined,
    },
    {
      href: '/admin/questions',
      icon: HelpCircle,
      label: 'Fragen',
      value: '—',
      sub: 'Verwalten & verstecken',
      color: 'text-indigo-400 bg-indigo-400/10',
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Shield size={18} className="text-accent" />
          </div>
          <h1 className="text-2xl font-black">Admin-Bereich</h1>
        </div>
        <p className="text-ui/40 text-sm">Vollständige Kontrolle über die App.</p>
      </motion.div>

      {/* Pending actions banner */}
      <AnimatePresence>
        {hasPending && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-3 border-b border-amber-500/10">
              <Bell size={15} className="text-amber-400 shrink-0" />
              <span className="text-sm font-semibold text-amber-400">Handlungsbedarf</span>
              <span className="ml-auto text-xs text-amber-400/60 font-mono">
                {openFeedback + pendingDisputes} offen
              </span>
            </div>
            <div className="divide-y divide-ui/5">
              {pendingNameChanges > 0 && (
                <Link
                  href="/admin/name-changes"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-amber-500/5 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                    <UserCheck size={14} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Namensänderungen prüfen</div>
                    <div className="text-xs text-ui/40">
                      {pendingNameChanges} {pendingNameChanges === 1 ? 'Anfrage wartet' : 'Anfragen warten'} auf Genehmigung
                    </div>
                  </div>
                  <span className="shrink-0 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {pendingNameChanges}
                  </span>
                </Link>
              )}
              {pendingDisputes > 0 && (
                <Link
                  href="/admin/disputes"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-amber-500/5 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                    <CheckSquare size={14} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Einsprüche prüfen</div>
                    <div className="text-xs text-ui/40">
                      {pendingDisputes} {pendingDisputes === 1 ? 'Antwort wartet' : 'Antworten warten'} auf Genehmigung
                    </div>
                  </div>
                  <span className="shrink-0 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {pendingDisputes}
                  </span>
                </Link>
              )}
              {openFeedback > 0 && (
                <Link
                  href="/admin/feedback"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-rose-500/5 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                    <MessageSquarePlus size={14} className="text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Feedback lesen</div>
                    <div className="text-xs text-ui/40">
                      {openFeedback} {openFeedback === 1 ? 'Nachricht' : 'Nachrichten'} noch nicht gelesen
                    </div>
                  </div>
                  <span className="shrink-0 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                    {openFeedback}
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={card.href}
                className="glass-hover glass rounded-2xl p-5 border border-ui/5 block relative"
              >
                {card.badge && (
                  <span className="absolute top-3 right-3 min-w-[1.25rem] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {card.badge}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <div className="text-2xl font-black">{card.value}</div>
                <div className="text-xs text-ui/40 mt-0.5">{card.sub}</div>
                <div className="text-xs text-ui/60 font-medium mt-1">{card.label}</div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5 border border-ui/5 flex items-start gap-3"
      >
        <AlertCircle size={18} className="text-accent mt-0.5 shrink-0" />
        <div className="text-sm text-ui/60">
          Du bist als <span className="text-accent font-semibold">Administrator</span> angemeldet. Änderungen hier betreffen alle Nutzer und sind teilweise nicht umkehrbar.
        </div>
      </motion.div>
    </div>
  )
}

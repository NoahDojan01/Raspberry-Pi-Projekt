'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, LayoutDashboard, PenLine, Target,
  Upload, LogOut, Menu, X, Flame, Star, Library, Trophy, User,
  MessageSquarePlus, Shield, Users, HelpCircle, CheckSquare, UserCheck, Wrench
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/helpers'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Profil' },
  { href: '/learn', icon: PenLine, label: 'Lernmodus' },
  { href: '/katalog', icon: Library, label: 'Fragenkatalog' },
  { href: '/test', icon: Target, label: 'Simulationstest' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/upload', icon: Upload, label: 'PDF Import' },
]

interface SidebarProps {
  userName: string
  userLevel: number
  userXP: number
  userStreak: number
  isAdmin?: boolean
  onFeedbackClick: () => void
}

export default function Sidebar({ userName, userLevel, userXP, userStreak, isAdmin = false, onFeedbackClick }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [liveXP, setLiveXP] = useState(userXP)
  const [liveLevel, setLiveLevel] = useState(userLevel)
  const [liveStreak, setLiveStreak] = useState(userStreak)

  useEffect(() => {
    async function refreshStats() {
      const res = await fetch('/api/stats')
      if (!res.ok) return
      const { stats } = await res.json()
      if (stats) {
        setLiveXP(stats.xp ?? userXP)
        setLiveLevel(stats.level ?? userLevel)
        setLiveStreak(stats.streak ?? userStreak)
      }
    }
    window.addEventListener('statsUpdated', refreshStats)
    return () => window.removeEventListener('statsUpdated', refreshStats)
  }, [userXP, userLevel, userStreak])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Erfolgreich abgemeldet')
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-ui/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center shrink-0 glow-accent">
          <BookOpen size={18} className="text-ui" />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">Jugend Lernapp</div>
          <div className="text-xs text-ui/40">FECG Speyer</div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-ui/5">
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className="block glass rounded-xl p-3 border border-ui/8 hover:border-accent/30 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold text-sm truncate max-w-[120px]">{userName}</div>
              <div className="text-xs text-accent font-medium">Level {liveLevel}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-xs text-orange-400">
                <Flame size={12} />
                <span>{liveStreak}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-accent">
                <Star size={12} />
                <span>{liveXP} XP</span>
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-ui/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((liveXP % 200) / 200 * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-accent to-accent rounded-full"
            />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-accent/12 text-accent border border-accent/20'
                  : 'text-ui/50 hover:text-ui/80 hover:bg-ui/5'
              )}
            >
              <Icon size={17} className={active ? 'text-accent' : 'text-ui/35'} />
              {item.label}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                />
              )}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <div className="text-[10px] font-semibold text-ui/25 uppercase tracking-widest">Admin</div>
            </div>
            {[
              { href: '/admin', icon: Shield, label: 'Übersicht' },
              { href: '/admin/members', icon: Users, label: 'Mitglieder' },
              { href: '/admin/questions', icon: HelpCircle, label: 'Fragen' },
              { href: '/admin/disputes', icon: CheckSquare, label: 'Antworten' },
              { href: '/admin/name-changes', icon: UserCheck, label: 'Namen' },
              { href: '/admin/feedback', icon: MessageSquarePlus, label: 'Feedback' },
              { href: '/admin/maintenance', icon: Wrench, label: 'Wartung' },
            ].map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-accent/12 text-accent border border-accent/20'
                      : 'text-ui/50 hover:text-ui/80 hover:bg-ui/5'
                  )}
                >
                  <Icon size={17} className={active ? 'text-accent' : 'text-ui/35'} />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="sidebar-admin-active"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                    />
                  )}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-3 border-t border-ui/5 space-y-0.5">
        {/* Feedback */}
        <button
          onClick={() => { setMobileOpen(false); onFeedbackClick() }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ui/45 hover:text-ui/80 hover:bg-ui/5 transition-all"
        >
          <MessageSquarePlus size={17} className="text-ui/30" />
          Feedback geben
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ui/35 hover:text-rose-400 hover:bg-rose-500/8 transition-all"
        >
          <LogOut size={17} />
          Abmelden
        </button>

        <p className="text-center text-[10px] text-ui/15 pt-1 tracking-wide">
          Created by Noah Dojan
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen glass border-r border-ui/5 fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 glass border-b border-ui/5 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 glass rounded-xl border border-ui/10 flex items-center justify-center text-ui/60 hover:text-ui/90 transition-colors"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-accent flex items-center justify-center">
            <BookOpen size={13} className="text-ui" />
          </div>
          <span className="font-bold text-sm">Jugend Lernapp</span>
        </div>
        <button
          onClick={onFeedbackClick}
          className="w-9 h-9 glass rounded-xl border border-ui/10 flex items-center justify-center text-ui/60 hover:text-accent transition-colors"
          title="Feedback geben"
        >
          <MessageSquarePlus size={17} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 glass-strong border-r border-ui/10 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg glass border border-ui/10 flex items-center justify-center text-ui/40 hover:text-ui/80"
              >
                <X size={15} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

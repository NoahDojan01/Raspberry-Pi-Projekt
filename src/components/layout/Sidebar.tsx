'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, LayoutDashboard, PenLine, Target,
  Upload, LogOut, Menu, X, Flame, Star, Library, Trophy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/helpers'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
}

export default function Sidebar({ userName, userLevel, userXP, userStreak }: SidebarProps) {
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
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 glow-violet">
          <BookOpen size={18} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">Jugend Lernapp</div>
          <div className="text-xs text-white/40">FECG Speyer</div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="glass rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold text-sm truncate max-w-[120px]">{userName}</div>
              <div className="text-xs text-violet-400 font-medium">Level {liveLevel}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Flame size={12} />
                <span>{liveStreak}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-violet-400">
                <Star size={12} />
                <span>{liveXP} XP</span>
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((liveXP % 200) / 200 * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              <Icon size={18} className={active ? 'text-violet-400' : 'text-white/40'} />
              {item.label}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={18} />
          Abmelden
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen glass border-r border-white/5 fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 glass rounded-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 glass-strong border-r border-white/10 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

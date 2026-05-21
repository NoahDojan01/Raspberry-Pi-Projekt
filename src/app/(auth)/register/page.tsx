'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const passwordRequirements = [
  { label: 'Mindestens 8 Zeichen', test: (p: string) => p.length >= 8 },
  { label: 'Mindestens eine Zahl', test: (p: string) => /\d/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) return

    if (password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen haben')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) {
      toast.error(
        error.message === 'User already registered'
          ? 'Diese E-Mail ist bereits registriert'
          : error.message
      )
      setLoading(false)
      return
    }

    toast.success('Konto erstellt! Willkommen! 🎉')
    window.location.href = '/dashboard'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass-strong rounded-3xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Konto erstellen</h1>
          <p className="text-white/50">Starte deine Lernreise kostenlos</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
              required
              className="w-full px-4 py-3 glass rounded-xl border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="w-full px-4 py-3 glass rounded-xl border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Passwort</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 glass rounded-xl border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      req.test(password) ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-white hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 mt-6"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Registrieren...</>
            ) : (
              <><UserPlus size={18} /> Kostenlos registrieren</>
            )}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm text-white/40">
          Bereits registriert?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
            Anmelden
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

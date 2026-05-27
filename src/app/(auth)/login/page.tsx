'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'Ungültige E-Mail oder Passwort'
        : error.message
      )
      setLoading(false)
      return
    }

    toast.success('Willkommen zurück! 👋')
    window.location.href = '/dashboard'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass-strong rounded-3xl p-8 border border-ui/10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Willkommen zurück</h1>
          <p className="text-ui/50">Melde dich an, um weiterzulernen</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-ui/70 mb-2">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="w-full px-4 py-3 glass rounded-xl border border-ui/10 text-ui placeholder-ui/30 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-ui/70 mb-2">
              Passwort
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 glass rounded-xl border border-ui/10 text-ui placeholder-ui/30 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ui/40 hover:text-ui/70 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-accent to-accent rounded-xl font-semibold text-ui hover:from-accent hover:to-accent transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-accent/20 mt-6"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Anmelden...</>
            ) : (
              <><LogIn size={18} /> Anmelden</>
            )}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm text-ui/40">
          Noch kein Konto?{' '}
          <Link href="/register" className="text-accent hover:text-accent transition-colors font-medium">
            Registrieren
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

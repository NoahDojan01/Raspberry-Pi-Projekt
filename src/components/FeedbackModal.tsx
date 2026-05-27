'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, MessageSquare, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), name: name.trim() }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
      setMessage('')
      setName('')
    } catch {
      toast.error('Feedback konnte nicht gesendet werden')
    } finally {
      setSending(false)
    }
  }

  function handleClose() {
    onClose()
    setTimeout(() => setSent(false), 300)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Centering wrapper – flex handles position, motion handles animation */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <div className="glass-strong rounded-2xl border border-ui/10 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ui/8">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center">
                    <MessageSquare size={15} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm">Feedback</h2>
                    <p className="text-xs text-ui/40">Teile deine Gedanken</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg glass border border-ui/10 flex items-center justify-center text-ui/40 hover:text-ui/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center space-y-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle size={28} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold">Danke für dein Feedback!</p>
                      <p className="text-sm text-ui/50 mt-1">Es wurde erfolgreich übermittelt.</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="mt-2 px-5 py-2 bg-accent/15 border border-accent/20 text-accent rounded-xl text-sm font-medium hover:bg-accent/20 transition-colors"
                    >
                      Schließen
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name (optional) */}
                    <div>
                      <label className="block text-xs font-medium text-ui/50 mb-1.5">
                        Name <span className="text-ui/25">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Dein Name..."
                        maxLength={60}
                        className="w-full px-3.5 py-2.5 glass rounded-xl border border-ui/10 text-sm placeholder-ui/25 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-medium text-ui/50 mb-1.5">
                        Nachricht <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Was gefällt dir? Was könnte besser sein?..."
                        required
                        rows={4}
                        maxLength={1000}
                        className="w-full px-3.5 py-2.5 glass rounded-xl border border-ui/10 text-sm placeholder-ui/25 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all resize-none"
                      />
                      <div className="text-right text-xs text-ui/25 mt-1">{message.length}/1000</div>
                    </div>

                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-accent to-accent rounded-xl text-sm font-semibold text-ui disabled:opacity-40 disabled:cursor-not-allowed hover:from-accent hover:to-accent transition-all shadow-lg shadow-accent/20"
                    >
                      {sending
                        ? <><Loader2 size={15} className="animate-spin" /> Senden...</>
                        : <><Send size={15} /> Feedback senden</>
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

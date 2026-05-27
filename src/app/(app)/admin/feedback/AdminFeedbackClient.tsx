'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, MessageSquare, Clock, User, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

interface FeedbackItem {
  id: string
  name: string | null
  message: string
  resolved: boolean
  created_at: string
  user_id: string | null
}

interface Props {
  initialFeedback: FeedbackItem[]
}

export default function AdminFeedbackClient({ initialFeedback }: Props) {
  const [items, setItems] = useState<FeedbackItem[]>(initialFeedback)
  const [toggling, setToggling] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')

  async function toggleResolved(id: string, current: boolean) {
    setToggling(id)
    const res = await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, resolved: !current }),
    })
    if (res.ok) {
      setItems(prev => prev.map(f => f.id === id ? { ...f, resolved: !current } : f))
    }
    setToggling(null)
  }

  async function refresh() {
    setRefreshing(true)
    const res = await fetch('/api/feedback')
    if (res.ok) {
      const { feedback } = await res.json()
      setItems(feedback ?? [])
    }
    setRefreshing(false)
  }

  const filtered = items.filter(f =>
    filter === 'all' ? true : filter === 'open' ? !f.resolved : f.resolved
  )
  const openCount = items.filter(f => !f.resolved).length

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Feedback</h1>
          <p className="text-ui/40 text-sm mt-0.5">
            {openCount} offen · {items.length} gesamt
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 glass rounded-xl border border-ui/10 text-sm text-ui/50 hover:text-ui/80 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Aktualisieren
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'open', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-xl text-sm font-medium transition-all',
              filter === f
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'text-ui/60 hover:text-ui/85 hover:bg-ui/5'
            )}
          >
            {f === 'all' ? 'Alle' : f === 'open' ? 'Offen' : 'Erledigt'}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <MessageSquare size={32} className="mx-auto text-ui/15" />
          <p className="text-ui/30 text-sm">Kein Feedback vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'glass rounded-2xl border p-4 transition-all',
                item.resolved ? 'border-ui/5 opacity-60' : 'border-ui/10'
              )}
            >
              <div className="flex gap-3">
                {/* Toggle button */}
                <button
                  onClick={() => toggleResolved(item.id, item.resolved)}
                  disabled={toggling === item.id}
                  className="mt-0.5 shrink-0 text-ui/30 hover:text-emerald-400 transition-colors"
                  title={item.resolved ? 'Als offen markieren' : 'Als erledigt markieren'}
                >
                  {toggling === item.id
                    ? <Loader2 size={18} className="animate-spin" />
                    : item.resolved
                    ? <CheckCircle size={18} className="text-emerald-400" />
                    : <Circle size={18} />
                  }
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className={cn('text-sm leading-relaxed', item.resolved && 'line-through text-ui/40')}>
                    {item.message}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-ui/35">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {item.name || (item.user_id ? 'Angemeldet' : 'Anonym')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(item.created_at).toLocaleDateString('de-DE', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

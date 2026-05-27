'use client'

import { useState } from 'react'
import { Wrench, ShieldCheck, Save, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMaintenanceClient({
  initialEnabled,
  initialUntil,
  initialMessage,
}: {
  initialEnabled: boolean
  initialUntil: string | null
  initialMessage: string
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [until, setUntil] = useState(
    initialUntil ? new Date(initialUntil).toISOString().slice(0, 16) : ''
  )
  const [message, setMessage] = useState(initialMessage)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          until: until ? new Date(until).toISOString() : null,
          message: message.trim() || 'Wartungsarbeiten',
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Wrench size={18} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Wartungsmodus</h1>
          <p className="text-ui/50 text-sm">App für alle Nutzer sperren</p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-ui/10 p-5 space-y-5">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Wartungsmodus aktiv</div>
            <div className="text-xs text-ui/40 mt-0.5">Alle Nutzer sehen die Wartungsseite</div>
          </div>
          <button
            onClick={() => setEnabled(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              enabled
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/35 hover:bg-amber-500/30'
                : 'glass border-ui/15 text-ui/65 hover:text-ui/90 hover:border-ui/30'
            }`}
          >
            {enabled ? <><ToggleRight size={16} /> Aktiv</> : <><ToggleLeft size={16} /> Inaktiv</>}
          </button>
        </div>

        {/* Until */}
        <div className="space-y-1.5">
          <label className="text-xs text-ui/50 font-medium">Automatisch beenden am</label>
          <input
            type="datetime-local"
            value={until}
            onChange={e => setUntil(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-2.5 glass rounded-xl border border-ui/10 text-sm focus:outline-none focus:border-accent/40 transition-all"
          />
          <p className="text-xs text-ui/35">Leer lassen = manuell beenden</p>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs text-ui/50 font-medium">Anzeige-Meldung</label>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Wartungsarbeiten"
            maxLength={120}
            className="w-full px-4 py-2.5 glass rounded-xl border border-ui/10 text-sm placeholder-ui/25 focus:outline-none focus:border-accent/40 transition-all"
          />
          <p className="text-xs text-ui/35">Wird als Überschrift auf der Wartungsseite angezeigt</p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-accent rounded-xl text-sm font-semibold disabled:opacity-50 transition-all shadow-lg shadow-accent/15"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Speichern
        </button>
      </div>

      <div className="flex items-start gap-2 px-4 py-3 glass rounded-xl border border-emerald-500/20 text-sm text-emerald-400/80">
        <ShieldCheck size={15} className="shrink-0 mt-0.5" />
        Du als Admin hast immer Zugriff auf die App, unabhängig vom Wartungsmodus.
      </div>
    </div>
  )
}

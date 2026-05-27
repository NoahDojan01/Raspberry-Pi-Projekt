import { createClient as createAnonClient } from '@supabase/supabase-js'
import { Wrench, Clock, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ banned?: string }>
}) {
  const params = await searchParams
  const isBanned = params.banned === '1'

  let maintenanceMessage = 'Wartungsarbeiten'
  let maintenanceUntil: string | null = null

  if (!isBanned) {
    try {
      const client = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await client
        .from('app_settings')
        .select('maintenance_message, maintenance_until')
        .eq('id', 1)
        .single()
      if (data) {
        maintenanceMessage = data.maintenance_message || 'Wartungsarbeiten'
        maintenanceUntil = data.maintenance_until ?? null
      }
    } catch {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center ${
          isBanned
            ? 'bg-rose-500/15 border border-rose-500/25'
            : 'bg-amber-500/15 border border-amber-500/25'
        }`}>
          {isBanned
            ? <AlertTriangle size={36} className="text-rose-400" />
            : <Wrench size={36} className="text-amber-400" />
          }
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black">
            {isBanned ? 'Zugang gesperrt' : maintenanceMessage}
          </h1>
          <p className="text-ui/50 leading-relaxed">
            {isBanned
              ? 'Dein Account wurde vorübergehend gesperrt. Bitte versuche es zu einem späteren Zeitpunkt erneut oder kontaktiere den Administrator.'
              : 'Die App ist vorübergehend nicht verfügbar. Wir sind gleich wieder für dich da!'
            }
          </p>
        </div>

        {!isBanned && maintenanceUntil && (
          <div className="glass rounded-2xl border border-amber-500/20 px-5 py-4 flex items-center gap-3">
            <Clock size={16} className="text-amber-400 shrink-0" />
            <div className="text-sm text-left">
              <div className="text-ui/40 text-xs mb-0.5">Voraussichtlich wieder verfügbar</div>
              <div className="font-semibold">
                {new Date(maintenanceUntil).toLocaleString('de-DE', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })} Uhr
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

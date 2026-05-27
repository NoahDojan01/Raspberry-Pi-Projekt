import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import AccentProvider from '@/components/AccentProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jugend Lernapp – FECG Speyer/Schwegenheim',
  description: 'Lernplattform für die Jugendmitgliedsprüfung der FECG',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AccentProvider />
          <div className="fixed inset-0 bg-mesh pointer-events-none" aria-hidden />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--glass-bg-strong)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                color: 'rgb(var(--ui))',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: 'rgb(var(--ui))' },
              },
              error: {
                iconTheme: { primary: '#f43f5e', secondary: 'rgb(var(--ui))' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

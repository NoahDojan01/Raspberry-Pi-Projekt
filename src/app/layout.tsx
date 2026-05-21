import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jugend Lernapp – FECG Speyer/Schwegenheim',
  description: 'Moderne Lernplattform für die Jugendmitgliedsprüfung der FECG',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="antialiased">
        <div className="fixed inset-0 bg-mesh pointer-events-none" aria-hidden />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 10, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#f1f5f9',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#f1f5f9' },
            },
          }}
        />
      </body>
    </html>
  )
}

'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import FeedbackModal from '@/components/FeedbackModal'

interface AppShellProps {
  children: React.ReactNode
  userName: string
  userLevel: number
  userXP: number
  userStreak: number
  isAdmin?: boolean
}

export default function AppShell({ children, userName, userLevel, userXP, userStreak, isAdmin = false }: AppShellProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar
        userName={userName}
        userLevel={userLevel}
        userXP={userXP}
        userStreak={userStreak}
        isAdmin={isAdmin}
        onFeedbackClick={() => setFeedbackOpen(true)}
      />
      {/* Mobile top bar offset + desktop sidebar offset */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          {children}
        </div>
      </main>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} userName={userName} />
    </div>
  )
}

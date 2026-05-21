import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05030f] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/6 blur-[100px]" />
      </div>

      {/* Header */}
      <nav className="relative z-10 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center glow-violet">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">Jugend Lernapp</span>
        </Link>
      </nav>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  )
}

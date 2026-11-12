'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen, Brain, Trophy, Zap, ChevronRight,
  Sparkles, Target, BarChart3, Shield, Star
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'KI-Bewertung',
    description: 'Intelligente Auswertung deiner Freitextantworten – kleine Tippfehler kein Problem.',
    gradient: 'from-accent/20 to-accent/20',
    border: 'border-accent/25',
    iconColor: 'text-accent',
  },
  {
    icon: Target,
    title: 'Simulationstest',
    description: '20 zufällige Fragen, gemischt nach Schwierigkeit – genau wie die echte Prüfung.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    icon: BookOpen,
    title: 'Lernmodus',
    description: 'Alle 80 Fragen durchgehen, Antworten ansehen, eigenes Tempo bestimmen.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Trophy,
    title: 'XP & Level',
    description: 'Sammle Erfahrungspunkte, steige im Level auf und halte deinen Streak aufrecht.',
    gradient: 'from-accent/20 to-accent/20',
    border: 'border-accent/30',
    iconColor: 'text-accent',
  },
  {
    icon: BarChart3,
    title: 'Statistiken',
    description: 'Detaillierte Auswertungen, Fortschrittsdiagramme und Schwachstellenanalyse.',
    gradient: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
  },
  {
    icon: Zap,
    title: 'PDF Import',
    description: 'Eigene Fragenkataloge hochladen – KI erkennt Fragen und Antworten automatisch.',
    gradient: 'from-accent/20 to-accent/20',
    border: 'border-indigo-500/30',
    iconColor: 'text-indigo-400',
  },
]

const stats = [
  { value: '80', label: 'Fragen', suffix: '' },
  { value: '18', label: 'Kategorien', suffix: '' },
  { value: '100', label: 'Kostenlos', suffix: '%' },
  { value: '3', label: 'Schwierigkeiten', suffix: '' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05030f] text-ui overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center shadow-lg glow-accent">
            <BookOpen size={18} className="text-ui" />
          </div>
          <span className="font-bold text-lg tracking-tight">Jugend Lernapp</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-ui/70 hover:text-ui transition-colors"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-accent hover:bg-accent rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5"
          >
            Kostenlos starten
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/20 text-accent/70 text-sm mb-8"
        >
          <Sparkles size={14} />
          <span>Mit KI-gestützter Bewertung</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black leading-tight mb-6"
        >
          Lerne für die Jugend.
          <br />
          <span className="gradient-text">Wachse geistlich.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-ui/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Die Lernplattform für deine Jugendmitgliedsprüfung der FECG Speyer/Schwegenheim.
          80 Fragen, mit simulationsmodus, aber auch nur den Katalog — alles in einem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-accent rounded-2xl font-semibold text-lg hover:from-accent hover:to-accent transition-all hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1"
          >
            Jetzt kostenlos starten
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 glass border border-ui/10 rounded-2xl font-medium text-ui/80 hover:text-ui hover:border-accent/25 transition-all hover:-translate-y-1"
          >
            Bereits registriert
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-20"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-black gradient-text">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-ui/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black mb-4">
            Alles was du brauchst
          </h2>
          <p className="text-ui/50 text-lg max-w-xl mx-auto">
            Von KI-Bewertung bis zu Gamification — eine vollständige Lernplattform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-hover glass rounded-2xl p-6 border ${feature.border}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} border ${feature.border} flex items-center justify-center mb-4`}
                >
                  <Icon size={22} className={feature.iconColor} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-ui/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Preview card */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-8 border border-accent/20 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-ui/60">Live Demo – Simulationstest</span>
            </div>
            <div className="glass rounded-2xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">Mittel • 2 Punkte</span>
                <span className="text-xs text-ui/40">Frage 5 von 20</span>
              </div>
              <p className="font-semibold text-lg mb-2">
                Welche Schritte sind notwendig, um Gott zu erkennen?
              </p>
              <div className="flex gap-1 mt-4">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < 5 ? 'bg-accent' : 'bg-ui/10'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 glass rounded-xl px-4 py-3 text-sm text-ui/40 border border-ui/5">
                Deine Antwort eingeben...
              </div>
              <button className="px-4 py-3 bg-accent rounded-xl text-sm font-medium hover:bg-accent transition-colors">
                Weiter →
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-accent fill-amber-400" />
            ))}
          </div>
          <h2 className="text-4xl font-black mb-4">
            Bereit für die Prüfung?
          </h2>
          <p className="text-ui/50 mb-8 text-lg">
            Registriere dich kostenlos und beginne sofort zu lernen.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-accent rounded-2xl font-bold text-lg hover:from-accent hover:to-accent transition-all hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1"
          >
            <Shield size={20} />
            Kostenlos registrieren
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ui/5 py-8 px-6 text-center text-sm text-ui/30">
        <p>© 2024 Jugend Lernapp · FECG Speyer/Schwegenheim · Alle Rechte vorbehalten</p>
      </footer>
    </div>
  )
}

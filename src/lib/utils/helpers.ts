import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Difficulty } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDifficultyColor(difficulty: Difficulty): string {
  return {
    leicht: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    mittel: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    schwer: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  }[difficulty]
}

export function getDifficultyLabel(difficulty: Difficulty): string {
  return { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' }[difficulty]
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-emerald-400'
  if (percentage >= 60) return 'text-amber-400'
  return 'text-rose-400'
}

export function getScoreBg(percentage: number): string {
  if (percentage >= 80) return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30'
  if (percentage >= 60) return 'from-amber-500/20 to-amber-600/10 border-amber-500/30'
  return 'from-rose-500/20 to-rose-600/10 border-rose-500/30'
}

export function getScoreGrade(percentage: number): string {
  if (percentage >= 95) return 'Hervorragend! 🏆'
  if (percentage >= 85) return 'Sehr gut! ⭐'
  if (percentage >= 75) return 'Gut! 👍'
  if (percentage >= 60) return 'Bestanden ✓'
  return 'Nicht bestanden ✗'
}

export function calculateXP(percentage: number, difficulty: Difficulty, mode: string): number {
  const base = { leicht: 10, mittel: 20, schwer: 30 }[difficulty] || 10
  const modeMultiplier = mode === 'simulation' ? 1.5 : 1
  const scoreMultiplier = percentage / 100
  return Math.round(base * modeMultiplier * scoreMultiplier)
}

export function calculateLevel(xp: number): number {
  // Level formula: XP needed = level * 200
  return Math.floor(1 + Math.sqrt(xp / 100))
}

export function calculateXPForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

export function calculateXPToNextLevel(xp: number): { current: number; needed: number; percentage: number } {
  const level = calculateLevel(xp)
  const currentLevelXP = calculateXPForLevel(level)
  const nextLevelXP = calculateXPForLevel(level + 1)
  const progress = xp - currentLevelXP
  const needed = nextLevelXP - currentLevelXP
  return {
    current: progress,
    needed,
    percentage: Math.round((progress / needed) * 100),
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `vor ${minutes} Min.`
  if (hours < 24) return `vor ${hours} Std.`
  if (days === 1) return 'Gestern'
  if (days < 7) return `vor ${days} Tagen`
  return formatDate(dateString)
}

export function getLevelTitle(level: number): string {
  const titles = [
    'Neuling',
    'Lernender',
    'Schüler',
    'Fortgeschrittener',
    'Kenner',
    'Experte',
    'Meister',
    'Weiser',
    'Legende',
    'Glaubensstark',
  ]
  return titles[Math.min(level - 1, titles.length - 1)] || 'Meister'
}

export type Difficulty = 'leicht' | 'mittel' | 'schwer'
export type TestMode = 'lernen' | 'simulation'

export interface Question {
  id: number
  categoryNumber: number
  category: string
  question: string
  answer: string
  difficulty: Difficulty
  points: number
  requiresBrackets: boolean
  requiresOrder: boolean
  hint?: string
}

export interface Category {
  number: number
  name: string
  questions: Question[]
}

export interface UserAnswer {
  questionId: number
  answer: string
  score: number
  maxScore: number
  percentage: number
  feedback: string
  isCorrect: boolean
}

export interface TestSession {
  id: string
  userId: string
  mode: TestMode
  questions: Question[]
  answers: UserAnswer[]
  totalScore: number
  maxScore: number
  percentage: number
  startedAt: string
  completedAt?: string
  xpEarned: number
}

export interface UserStats {
  id: string
  userId: string
  xp: number
  level: number
  streak: number
  lastActivityDate: string | null
  totalTests: number
  averageScore: number
  bestScore: number
  totalQuestionsAnswered: number
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  stats: UserStats
  createdAt: string
}

export interface EvaluationResult {
  score: number
  percentage: number
  feedback: string
  isCorrect: boolean
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  xp: number
  level: number
  averageScore: number
}

export interface TestHistoryEntry {
  id: string
  mode: TestMode
  percentage: number
  totalScore: number
  maxScore: number
  questionsCount: number
  completedAt: string
  xpEarned: number
}

export interface DashboardStats {
  totalTests: number
  averageScore: number
  bestScore: number
  currentStreak: number
  xp: number
  level: number
  xpToNextLevel: number
  recentTests: TestHistoryEntry[]
  weakestCategories: { category: string; averageScore: number }[]
  strongestCategories: { category: string; averageScore: number }[]
}

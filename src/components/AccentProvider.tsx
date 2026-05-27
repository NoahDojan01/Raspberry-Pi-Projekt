'use client'

import { useEffect } from 'react'

export const THEME_MODE_KEY = 'jugend-theme-mode'
export const ACCENT_STORAGE_KEY = 'jugend-accent-color'
export const DEFAULT_ACCENT_HEX = '#f59e0b'

export type ThemeMode = 'dark' | 'light' | 'color-dark' | 'color-light'

function hexToRgbTriple(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '200 200 200'
  return `${r} ${g} ${b}`
}

export function applyAccentColor(hex: string) {
  const root = document.documentElement
  const rgb = hexToRgbTriple(hex)
  const rgbComma = rgb.replace(/ /g, ', ')
  root.style.setProperty('--accent-rgb', rgb)
  root.style.setProperty('--accent-hex', hex)
  root.style.setProperty('--accent-muted', `rgba(${rgbComma}, 0.30)`)
  root.style.setProperty('--accent-surface', `rgba(${rgbComma}, 0.10)`)
  root.style.setProperty('--accent-glow', `rgba(${rgbComma}, 0.18)`)
  root.style.setProperty('--scrollbar-thumb', `rgb(${rgb} / 0.3)`)
  root.style.setProperty('--scrollbar-thumb-hover', `rgb(${rgb} / 0.5)`)
}

export function applyNeutralAccent(base: 'dark' | 'light') {
  // Remove any custom CSS overrides so the globals.css defaults take over
  const root = document.documentElement
  const props = ['--accent-rgb', '--accent-hex', '--accent-muted', '--accent-surface',
    '--accent-glow', '--scrollbar-thumb', '--scrollbar-thumb-hover']
  props.forEach(p => root.style.removeProperty(p))
  // Explicitly set for light mode (dark mode default is already in :root)
  if (base === 'light') {
    root.style.setProperty('--accent-rgb', '80 80 80')
    root.style.setProperty('--accent-hex', '#505050')
    root.style.setProperty('--accent-muted', 'rgba(80,80,80,0.20)')
    root.style.setProperty('--accent-surface', 'rgba(80,80,80,0.08)')
    root.style.setProperty('--accent-glow', 'rgba(80,80,80,0.10)')
  }
}

export function resetAccentColor() {
  applyNeutralAccent('dark')
}

export default function AccentProvider() {
  useEffect(() => {
    const savedMode = (localStorage.getItem(THEME_MODE_KEY) ?? 'dark') as ThemeMode
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) ?? DEFAULT_ACCENT_HEX
    const isLight = savedMode === 'light' || savedMode === 'color-light'

    if (savedMode === 'color-dark' || savedMode === 'color-light') {
      applyAccentColor(savedAccent)
    } else {
      applyNeutralAccent(isLight ? 'light' : 'dark')
    }

    // Cross-device sync: if no local mode saved, fetch from server
    if (!localStorage.getItem(THEME_MODE_KEY)) {
      fetch('/api/profile')
        .then(r => r.json())
        .then(data => {
          if (!data.theme_preference) return
          try {
            const pref = JSON.parse(data.theme_preference) as { mode: ThemeMode; accent?: string }
            if (!pref.mode) return
            localStorage.setItem(THEME_MODE_KEY, pref.mode)
            if (pref.accent) localStorage.setItem(ACCENT_STORAGE_KEY, pref.accent)
            const prefIsLight = pref.mode === 'light' || pref.mode === 'color-light'
            // Update next-themes
            document.documentElement.classList.toggle('light', prefIsLight)
            document.documentElement.classList.toggle('dark', !prefIsLight)
            localStorage.setItem('theme', prefIsLight ? 'light' : 'dark')
            if (pref.mode === 'color-dark' || pref.mode === 'color-light') {
              applyAccentColor(pref.accent ?? DEFAULT_ACCENT_HEX)
            } else {
              applyNeutralAccent(prefIsLight ? 'light' : 'dark')
            }
          } catch { /* invalid JSON, ignore */ }
        })
        .catch(() => {})
    }
  }, [])

  return null
}

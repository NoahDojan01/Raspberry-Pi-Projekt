'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

// ── HSV ↔ HEX conversions ──────────────────────────────────────────────────
function hsvToHex(h: number, s: number, v: number): string {
  const s1 = s / 100, v1 = v / 100
  const c = v1 * s1
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v1 - c
  let r = 0, g = 0, b = 0
  if      (h < 60)  { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else              { r = c; g = 0; b = x }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToHsv(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  if (d > 0) {
    if (max === r)      h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else                h = ((r - g) / d + 4) * 60
  }
  return [Math.round(h), max === 0 ? 0 : Math.round(d / max * 100), Math.round(max * 100)]
}

interface Props {
  value: string
  onChange: (hex: string) => void
}

export default function ColorPicker({ value, onChange }: Props) {
  const [h, setH] = useState(0)
  const [s, setS] = useState(100)
  const [v, setV] = useState(100)
  const boxRef  = useRef<HTMLDivElement>(null)
  const hueRef  = useRef<HTMLDivElement>(null)
  const dragging = useRef<'box' | 'hue' | null>(null)

  // Sync when value changes from outside
  useEffect(() => {
    if (!value.startsWith('#') || value.length < 7) return
    const [nh, ns, nv] = hexToHsv(value)
    setH(nh); setS(ns); setV(nv)
  }, [value])

  const updateBox = useCallback((clientX: number, clientY: number) => {
    if (!boxRef.current) return
    const rect = boxRef.current.getBoundingClientRect()
    const newS = Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100)
    const newV = Math.round(Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)) * 100)
    setS(newS); setV(newV)
    onChange(hsvToHex(h, newS, newV))
  }, [h, onChange])

  const updateHue = useCallback((clientX: number) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const newH = Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 360)
    setH(newH)
    onChange(hsvToHex(newH, s, v))
  }, [s, v, onChange])

  function onBoxPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = 'box'
    e.currentTarget.setPointerCapture(e.pointerId)
    updateBox(e.clientX, e.clientY)
  }
  function onHuePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = 'hue'
    e.currentTarget.setPointerCapture(e.pointerId)
    updateHue(e.clientX)
  }
  function onBoxPointerMove(e: React.PointerEvent) {
    if (dragging.current === 'box') updateBox(e.clientX, e.clientY)
  }
  function onHuePointerMove(e: React.PointerEvent) {
    if (dragging.current === 'hue') updateHue(e.clientX)
  }
  function onPointerUp() { dragging.current = null }

  const pureHue = hsvToHex(h, 100, 100)
  const pinLeft = `${s}%`
  const pinTop  = `${100 - v}%`
  const hueLeft = `${(h / 360) * 100}%`

  return (
    <div className="space-y-3 select-none">
      {/* SV gradient box */}
      <div
        ref={boxRef}
        className="relative w-full rounded-xl overflow-hidden cursor-crosshair"
        style={{ height: 160, backgroundColor: pureHue }}
        onPointerDown={onBoxPointerDown}
        onPointerMove={onBoxPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* white → transparent (saturation) */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #fff, transparent)' }} />
        {/* transparent → black (value) */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
        {/* Draggable pin */}
        <div
          className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: pinLeft, top: pinTop,
            transform: 'translate(-50%, -50%)',
            backgroundColor: value,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {/* Hue strip */}
      <div
        ref={hueRef}
        className="relative w-full rounded-lg overflow-hidden cursor-pointer"
        style={{
          height: 20,
          background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
        }}
        onPointerDown={onHuePointerDown}
        onPointerMove={onHuePointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Hue thumb */}
        <div
          className="absolute top-1/2 pointer-events-none rounded"
          style={{
            left: hueLeft, width: 4, height: '100%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: pureHue,
            boxShadow: '0 0 0 2px white, 0 0 0 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* Hex + preview swatch */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl border border-ui/15 shrink-0"
          style={{ backgroundColor: value }}
        />
        <code className="flex-1 px-3 py-2 glass rounded-xl border border-ui/10 text-sm text-ui/60">
          {value.toUpperCase()}
        </code>
      </div>
    </div>
  )
}

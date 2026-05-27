'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface ParsedQuestion {
  number: number
  question: string
  answer: string
  difficulty: string
  category: string
}

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [parsed, setParsed] = useState<ParsedQuestion[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'saving' | 'done'>('upload')
  const [error, setError] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setError(null)
    } else {
      toast.error('Nur PDF-Dateien werden akzeptiert')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f?.type === 'application/pdf') {
      setFile(f)
      setError(null)
    }
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload fehlgeschlagen')

      setParsed(data.questions)
      setStep('preview')
      toast.success(`${data.questions.length} Fragen erkannt!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
      toast.error('Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setStep('saving')
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsed }),
      })
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setStep('done')
      toast.success('Fragen erfolgreich gespeichert! 🎉')
    } catch {
      toast.error('Speichern fehlgeschlagen')
      setStep('preview')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Upload className="text-accent" />
          PDF Import
        </h1>
        <p className="text-ui/50 mt-1">
          Lade einen Fragenkatalog als PDF hoch – KI erkennt Fragen automatisch
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-16 text-center transition-all ${
                dragging
                  ? 'border-accent bg-accent/10'
                  : file
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-ui/20 hover:border-accent/30 hover:bg-accent/5'
              }`}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <>
                  <FileText size={48} className="text-emerald-400 mx-auto mb-4" />
                  <p className="font-semibold text-emerald-400">{file.name}</p>
                  <p className="text-sm text-ui/40 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <Upload size={48} className="text-ui/20 mx-auto mb-4" />
                  <p className="font-semibold text-ui/70">PDF hierher ziehen</p>
                  <p className="text-sm text-ui/40 mt-1">oder klicken zum Auswählen</p>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-sm glass rounded-xl p-3 border border-rose-500/20">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Info */}
            <div className="glass rounded-2xl p-5 border border-ui/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-accent" />
                <h3 className="font-semibold text-sm">Was wird erkannt?</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-ui/50">
                {['Fragen & Antworten', 'Schwierigkeitsgrad', 'Kategorien', 'Sonderfälle'].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={13} className="text-accent" />
                    {i}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-accent to-accent rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-accent hover:to-accent transition-all shadow-lg shadow-accent/15"
            >
              {uploading ? (
                <><Loader2 size={20} className="animate-spin" /> KI analysiert PDF...</>
              ) : (
                <><Sparkles size={20} /> PDF analysieren</>
              )}
            </button>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{parsed.length} Fragen erkannt</h3>
              <button onClick={() => { setStep('upload'); setFile(null); setParsed([]) }} className="text-ui/40 hover:text-ui">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {parsed.map((q, i) => (
                <div key={i} className="glass rounded-xl p-4 border border-ui/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-ui/30">#{q.number || i + 1}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      q.difficulty === 'leicht' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' :
                      q.difficulty === 'schwer' ? 'text-rose-400 border-rose-400/20 bg-rose-400/10' :
                      'text-accent border-accent/20 bg-accent/10'
                    }`}>{q.difficulty}</span>
                  </div>
                  <p className="font-medium text-sm mb-1">{q.question}</p>
                  <p className="text-xs text-ui/40 line-clamp-2">{q.answer}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setStep('upload'); setFile(null) }} className="flex-1 py-3 glass rounded-xl border border-ui/10 text-sm hover:border-accent/20 transition-all">
                Neu hochladen
              </button>
              <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-accent to-accent rounded-xl font-semibold text-sm hover:from-accent hover:to-accent transition-all">
                Speichern
              </button>
            </div>
          </motion.div>
        )}

        {step === 'saving' && (
          <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Loader2 size={48} className="animate-spin text-accent mx-auto mb-4" />
            <p className="text-ui/50">Fragen werden gespeichert...</p>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Gespeichert!</h2>
            <p className="text-ui/50 mb-6">{parsed.length} Fragen erfolgreich importiert</p>
            <button onClick={() => { setStep('upload'); setFile(null); setParsed([]) }} className="px-6 py-3 bg-gradient-to-r from-accent to-accent rounded-xl font-semibold hover:from-accent hover:to-accent transition-all">
              Weitere hochladen
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

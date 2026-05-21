# Jugend Lernapp – FECG Speyer/Schwegenheim

Eine moderne Premium-Lernplattform für die Jugendmitgliedsprüfung der FECG.

## Tech-Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes (App Router)
- **Datenbank & Auth**: Supabase (PostgreSQL + Auth)
- **KI-Bewertung**: Anthropic Claude API (claude-haiku-4-5)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **PDF-Parsing**: pdf-parse
- **Konfetti**: canvas-confetti

## Features

- 🎯 **80 Fragen** aus 18 Kategorien (leicht / mittel / schwer)
- 🤖 **KI-Bewertung** mit Claude – Tippfehler und Synonyme werden toleriert
- 📚 **Lernmodus** – alle Fragen durchblättern, filtern, suchen
- 🎮 **Simulationstest** – 20 zufällige Prüfungsfragen, realistische Prüfungssimulation
- 📊 **Dashboard** mit Statistiken, XP-System, Streak, Level
- 📤 **PDF Import** – eigene Fragenkataloge hochladen
- 🏆 **XP & Level System** mit motivierenden Fortschrittsanzeigen
- 🔐 **Benutzerkonten** mit Login/Register und Fortschrittsspeicherung
- 🎉 **Konfetti** bei guten Ergebnissen (≥80%)
- 🌙 **Dark Mode** (standardmäßig)
- 📱 **Responsive** – Mobile-first Design

## Installation

### 1. Repository klonen

```bash
git clone <repo-url>
cd jugend-lernapp
```

### 2. Abhängigkeiten installieren

```bash
npm install
# oder
yarn install
# oder
pnpm install
```

### 3. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Gehe zu **SQL Editor** und führe den Inhalt von `supabase/schema.sql` aus
3. Kopiere **Project URL** und **anon key** aus den Projekteinstellungen

### 4. Anthropic API Key holen

1. Gehe zu [console.anthropic.com](https://console.anthropic.com)
2. Erstelle einen neuen API Key

### 5. Umgebungsvariablen konfigurieren

```bash
cp .env.local.example .env.local
```

Fülle `.env.local` aus:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
ANTHROPIC_API_KEY=sk-ant-dein-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Füge alle Umgebungsvariablen in Vercel Dashboard hinzu.

## Projektstruktur

```
jugend-lernapp/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Register
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/               # Geschützte App-Seiten
│   │   │   ├── dashboard/       # Dashboard mit Statistiken
│   │   │   ├── learn/           # Lernmodus (alle 80 Fragen)
│   │   │   ├── test/            # Simulationstest (20 Fragen)
│   │   │   ├── results/[id]/    # Testergebnisse
│   │   │   └── upload/          # PDF Import
│   │   ├── api/
│   │   │   ├── evaluate/        # KI-Antwortbewertung
│   │   │   ├── questions/       # Fragen CRUD
│   │   │   ├── test/submit/     # Test-Session speichern
│   │   │   ├── upload/          # PDF-Parser
│   │   │   └── stats/           # Benutzerstatistiken
│   │   ├── layout.tsx           # Root Layout
│   │   └── page.tsx             # Landing Page
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx      # Seitennavigation
│   ├── data/
│   │   └── questions.ts         # Alle 80 Fragen
│   ├── lib/
│   │   ├── ai/evaluate.ts       # Anthropic API Aufruf
│   │   ├── supabase/            # Supabase Clients
│   │   └── utils/helpers.ts     # Hilfsfunktionen
│   └── types/index.ts           # TypeScript Typen
├── supabase/
│   └── schema.sql               # Datenbankschema
├── middleware.ts                 # Auth-Middleware
└── .env.local.example
```

## Besondere Regeln (aus dem Fragenkatalog)

- **Frage 28** (Natur-Analogie): Die Inhalte in Klammern sind **Pflicht** für volle Punktzahl
- **Frage 80** (Zehn Gebote): Muss in **exakter Reihenfolge** (1-10) angegeben werden

## Punktesystem

| Schwierigkeit | Punkte |
|---|---|
| Leicht | 1 Punkt |
| Mittel | 2 Punkte |
| Schwer | 3 Punkte |

## KI-Bewertungslogik

- Kleine Rechtschreibfehler → volle Punktzahl
- Sinngemäß richtige Antworten → volle/teilweise Punktzahl  
- Ähnliche Formulierungen → Teilpunkte
- Vollständig falsch → 0 Punkte
- Fallback ohne API Key: einfaches Keyword-Matching

## Simulationstest-Auswahl

20 Fragen werden zufällig ausgewählt:
- 7 leichte Fragen
- 7 mittlere Fragen  
- 6 schwere Fragen

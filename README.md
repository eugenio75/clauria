# CLAURIA — Non sei solo.

**Clauria** è un'app web di supporto emotivo basata su intelligenza artificiale. Offre uno spazio sicuro e riservato dove gli utenti possono parlare delle proprie emozioni, ricevere ascolto empatico e orientamento attraverso una conversazione guidata da AI.

## 🏗️ Architettura

| Layer | Tecnologia |
|-------|-----------|
| **Frontend** | React 18 + TypeScript 5 + Vite 5 |
| **Styling** | Tailwind CSS v3 + shadcn/ui (Radix UI) |
| **Animazioni** | Framer Motion |
| **Routing** | React Router DOM v6 |
| **State / Data** | TanStack React Query v5 |
| **Backend** | Supabase (Auth, Database, Edge Functions, Storage) |
| **AI** | Lovable AI (modelli Google Gemini / OpenAI GPT) |
| **i18n** | Sistema custom con supporto IT / EN |

## 📁 Struttura del progetto

```
src/
├── components/          # Componenti UI
│   ├── ui/              # Componenti shadcn/ui (Button, Dialog, etc.)
│   ├── LoginScreen.tsx  # Schermata login (Email OTP + Guest)
│   ├── AuthGate.tsx     # Gate autenticazione post-onboarding
│   ├── WelcomeScreen.tsx # Tour iniziale (3 pagine)
│   ├── SplashScreen.tsx # Splash con logo
│   ├── ChatInput.tsx    # Input messaggio chat
│   ├── MessageBubble.tsx # Bolla messaggio
│   ├── TypingIndicator.tsx # Indicatore digitazione AI
│   ├── CrisisCard.tsx   # Card emergenza crisi
│   ├── SilenceMode.tsx  # Modalità silenzio
│   ├── UnsentLetter.tsx # Lettera non inviata
│   ├── SettingsPanel.tsx # Pannello impostazioni
│   └── EmailUpgrade.tsx # Upgrade account guest → email
├── hooks/               # Custom React hooks
│   ├── useIntusAuth.ts  # Hook autenticazione
│   └── useIntusContext.ts # Hook contesto conversazione
├── i18n/                # Internazionalizzazione
│   ├── LanguageContext.tsx
│   └── translations.ts  # Traduzioni IT/EN
├── integrations/
│   ├── supabase/        # Client e types Supabase (auto-generati)
│   └── lovable/         # Integrazione Lovable Cloud
├── pages/
│   ├── Index.tsx        # Pagina principale (orchestratore flusso)
│   └── NotFound.tsx     # Pagina 404
└── lib/
    └── utils.ts         # Utility (cn, etc.)

supabase/
└── functions/           # Edge Functions (Deno)
    ├── auth-email-hook/ # Hook autenticazione email
    ├── intus-chat/      # Endpoint chat AI
    ├── migrate-guest-data/ # Migrazione dati guest → utente registrato
    ├── send-login-otp/  # Invio codice OTP via SMTP
    └── verify-login-otp/ # Verifica codice OTP
```

## 🔐 Autenticazione

- **Email OTP**: l'utente inserisce la propria email, riceve un codice a 6 cifre via SMTP e lo verifica
- **Guest mode**: accesso anonimo senza registrazione, con possibilità di upgrade successivo
- Le sessioni sono persistenti tramite Supabase Auth

## 🗄️ Database (Supabase / PostgreSQL)

| Tabella | Descrizione |
|---------|-------------|
| `intus_profiles` | Profilo utente (nome, età, contesto di vita) |
| `intus_context` | Contesto conversazionale AI (tema emotivo, storico sessioni, tono) |
| `otp_codes` | Codici OTP temporanei per login via email |

Tutte le tabelle hanno **Row Level Security (RLS)** abilitato.

## 🚀 Flusso utente

1. **Splash Screen** → Logo e animazione iniziale
2. **Welcome Screen** → Tour di 3 pagine (solo prima visita)
3. **Login Screen** → Email OTP o Guest
4. **Onboarding** → Domande iniziali (nome, età, contesto)
5. **Chat** → Conversazione AI empatica

## 🛠️ Sviluppo locale

### Prerequisiti
- Node.js ≥ 18
- npm / bun / pnpm

### Setup
```bash
# Installa dipendenze
npm install

# Avvia dev server
npm run dev

# Build produzione
npm run build

# Test
npm test
```

### Variabili d'ambiente richieste
```env
VITE_SUPABASE_URL=<url-progetto-supabase>
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key-supabase>
```

### Secrets Edge Functions (Supabase)
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USERNAME=<email-smtp>
SMTP_PASSWORD=<password-smtp>
SMTP_FROM=CLAURIA <noreply@tuodominio.com>
```

## 📦 Build & Deploy

L'app è una **SPA (Single Page Application)** statica. Il build produce file statici in `dist/`.

```bash
npm run build
# Output → dist/
```

Il deploy può essere fatto su qualsiasi hosting statico (Vercel, Netlify, Cloudflare Pages, Nginx, etc.).

## 📄 Licenza

Progetto privato — Tutti i diritti riservati.

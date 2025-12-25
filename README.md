# Intresseanmälan-system - Spånga TBK

Mobilvänlig webbapp för intresseanmälan till tennis och bordtennis. Användare skannar QR-kod och fyller i formulär, ansökningar sparas i databas och kan hanteras via adminpanel.

## Teknisk Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databas**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Autentisering**: Supabase Auth

## Setup

### 1. Installera dependencies

```bash
npm install
```

### 2. Konfigurera Supabase

1. Skapa ett nytt projekt på [Supabase](https://supabase.com)
2. Gå till Project Settings > API och kopiera:
   - Project URL
   - `anon` `public` key
   - `service_role` key (för server-side operations)

3. Skapa `.env.local` fil i projektets root:

```env
NEXT_PUBLIC_SUPABASE_URL=din_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=din_supabase_service_role_key
```

### 3. Skapa databas

1. Öppna Supabase Dashboard > SQL Editor
2. Kör SQL-scriptet från `supabase/schema.sql`
3. Detta skapar:
   - `applications` tabell
   - `admin_users` tabell
   - RLS policies
   - Indexes och triggers

### 4. Skapa admin-användare

Se detaljerad guide i `ADMIN-SETUP.md` för steg-för-steg instruktioner.

**Kortfattat:**
1. Skapa användare i Supabase Dashboard > Authentication > Users
2. Kopiera User ID (UUID)
3. Lägg till i `admin_users` tabellen via SQL Editor:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('user-uuid-från-supabase', 'admin@example.com', 'admin');
```

4. Logga in på `/admin/login` med e-post och lösenord

### 5. Kör utvecklingsserver

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

## Deployment till Netlify

### 1. Bygg projektet lokalt

```bash
npm run build
```

### 2. Deploy till Netlify

1. Pusha koden till GitHub
2. Gå till [Netlify](https://netlify.com) och skapa nytt projekt
3. Koppla till ditt GitHub-repo
4. Lägg till environment variables i Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3. Konfigurera domän

1. I Netlify Dashboard, gå till Site settings > Domain management
2. Lägg till din custom domän eller subdomän
3. Följ instruktionerna för DNS-konfiguration

### 4. Skapa QR-kod

När domänen är konfigurerad, skapa en QR-kod som pekar på:
`https://din-domän.se/form`

## Projektstruktur

```
├── app/
│   ├── form/              # Formulärsida
│   ├── admin/             # Adminpanel
│   │   ├── login/         # Inloggning
│   │   └── applications/  # Ansökningslista
│   └── api/               # API routes
├── components/
│   ├── ApplicationForm.tsx      # Huvudformulär
│   ├── ApplicationPreview.tsx   # Förhandsvisning
│   └── admin/                    # Admin-komponenter
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── validation.ts      # Zod schemas
│   └── translations.ts    # Språkstöd (SV/EN)
├── types/
│   └── database.ts        # TypeScript types
└── supabase/
    └── schema.sql         # Databasschema
```

## Funktioner

### Formulär (Publik)
- Mobilvänlig design
- Svenska/Engelska språkval
- Validering av alla fält
- Förhandsvisning innan skick
- Stöd för tennis och bordtennis
- Målsmansinformation (obligatorisk för <18 år, valfri för 18+)
- Önskade träningsdagar/tider
- Samtycke för gruppfoto

### Adminpanel
- Inloggning via Supabase Auth
- Lista över alla ansökningar
- Sökfunktion (namn, e-post, telefon)
- Filter (status, sport)
- Detaljvy för varje ansökan
- Uppdatera status
- Adminanteckningar

## Status-värden

- `new` - Ny ansökan
- `contacted` - Kontaktad
- `queued` - Köad
- `placed` - Placerad
- `aborted` - Avbruten

## Säkerhet

- Row Level Security (RLS) i Supabase
- Publika endpoints: endast INSERT
- Admin endpoints: kräver autentisering
- HTTPS endast i produktion

## Framtida funktioner (inte implementerade än)

- E-postbekräftelse till användare (AWS SES)
- E-postnotis till kansli (AWS SES)
- Export till CSV/Excel
- Statistik/dashboard
- Bulk-åtgärder

## Support

För frågor eller problem, kontakta utvecklaren.


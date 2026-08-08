# birthday-2026

Felix 18. Geburtstag – Party-Webseite.

- **Hosting**: rein statisch über **GitHub Pages** (`index.html`), es gibt
  keinen eigenen Server.
- **Datenbank**: [Supabase](https://supabase.com) – eine kostenlose,
  gehostete Postgres-Datenbank mit fertiger REST-API. Der Browser spricht
  direkt (über den `supabase-js`-Client) mit Supabase, ganz ohne eigenen
  Backend-Code. Speichert Musikwünsche (inkl. Likes) und hochgeladene Fotos
  dauerhaft, statt nur im Browser der jeweiligen Besucher:in.

## Setup in 4 Schritten

1. **Supabase-Projekt anlegen**
   - Auf [supabase.com](https://supabase.com) registrieren (z.B. mit
     GitHub-Account) → **New Project**.
   - Name/Passwort vergeben, Region z.B. „Frankfurt (eu-central-1)“ wählen,
     Projekt erstellen (dauert ~1–2 Minuten).

2. **Datenbank-Schema einrichten**
   - Im Projekt-Dashboard: **SQL Editor** → **New query**.
   - Inhalt von [`supabase/schema.sql`](supabase/schema.sql) hineinkopieren
     und mit **Run** ausführen.
   - Das legt die Tabelle für Musikwünsche, die Zugriffsregeln (Row Level
     Security) und einen öffentlichen Storage-Bucket `photos` für die
     Foto-Uploads an.

3. **Zugangsdaten eintragen**
   - Im Dashboard: **Project Settings → API**.
   - `Project URL` und den `anon public` Key kopieren.
   - In [`index.html`](index.html) im `<script>`-Block eintragen:

     ```js
     const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
     const SUPABASE_ANON_KEY = "eyJ...";
     ```

     Der `anon`-Key ist bewusst öffentlich nutzbar (er landet sichtbar im
     Frontend) – der eigentliche Zugriffsschutz läuft über die
     Row-Level-Security-Regeln aus `supabase/schema.sql`.

4. **Pushen** – wie gewohnt auf `main` pushen, GitHub Pages baut die Seite
   automatisch aus `index.html`.

## Was sich geändert hat

- Musikwünsche werden in Supabase (Postgres) gespeichert und sind für alle
  Besucher:innen sichtbar (inkl. Like-Zähler, der wirklich persistiert wird).
- Fotos werden beim Hochladen in einen Supabase-Storage-Bucket geschickt und
  unterhalb der Upload-Fläche als Galerie angezeigt (vorher passierte mit
  hochgeladenen Fotos nichts – es gab nur eine Bestätigung).
- Sind `SUPABASE_URL`/`SUPABASE_ANON_KEY` noch nicht gesetzt oder Supabase
  nicht erreichbar, zeigt die Seite einen dezenten Hinweis statt kaputt zu
  wirken – Design und restliche Funktionen bleiben unverändert.

## Hinweise zum Supabase-Free-Tier

- Kostenlos, kein zusätzliches Hosting/Deployment nötig (im Gegensatz zu
  einem eigenen Node-Server).
- Ein kostenloses Projekt pausiert nach ca. 1 Woche Inaktivität automatisch;
  es reaktiviert sich von selbst, sobald wieder ein Aufruf kommt (kann beim
  ersten Request nach längerer Pause ein paar Sekunden dauern).
- Limits (Stand heute): 500 MB Datenbank, 1 GB Storage – für eine Party-Seite
  mehr als ausreichend.

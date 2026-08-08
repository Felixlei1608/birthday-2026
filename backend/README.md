# Felix Birthday – Backend

Kleine Express-API mit SQLite-Datenbank (`better-sqlite3`) für die Party-Webseite.
Speichert **Musikwünsche** (inkl. Likes) und **Foto-Uploads** dauerhaft, statt nur
im Browser des jeweiligen Besuchers.

## Lokal starten

```bash
cd backend
npm install
npm start
```

Server läuft danach auf `http://localhost:3001`. Die SQLite-Datei entsteht
automatisch unter `backend/data/party.db`, Fotos landen in `backend/uploads/`.

## API

| Methode | Pfad                | Beschreibung                              |
|---------|---------------------|--------------------------------------------|
| GET     | `/api/health`       | Health-Check                              |
| GET     | `/api/songs`        | Liste aller Musikwünsche (nach Likes sortiert) |
| POST    | `/api/songs`        | Neuer Musikwunsch, Body: `{ "text": "..." }` |
| POST    | `/api/songs/:id/like` | Likes für einen Song um 1 erhöhen        |
| GET     | `/api/photos`       | Liste aller hochgeladenen Fotos           |
| POST    | `/api/photos`       | Fotos hochladen (`multipart/form-data`, Feld `photos`, bis zu 10 Dateien) |

## Deployment auf Railway

1. Auf [railway.app](https://railway.app) einloggen (z.B. mit GitHub-Account).
2. **New Project → Deploy from GitHub repo** und dieses Repository auswählen.
3. Wichtig: Als **Root Directory** `backend` einstellen (Railway → Settings →
   Root Directory), damit nur das Backend gebaut/gestartet wird.
4. Unter **Variables** die Umgebungsvariable setzen:
   - `CORS_ORIGIN` = deine GitHub-Pages-URL, z.B. `https://<username>.github.io`
     (mehrere Origins durch Komma trennen)
5. Railway erkennt Node.js automatisch, führt `npm install` und `npm start` aus.
6. Nach dem Deploy bekommst du eine URL wie `https://<projekt>.up.railway.app`.
   Diese URL trägst du im Frontend (`index.html`, Konstante `API_BASE_URL`) ein.

### Persistenz der SQLite-Datei & Fotos (wichtig!)

Ohne ein **Volume** wird der Dateisystem-Inhalt bei jedem Redeploy/Neustart
zurückgesetzt – die Datenbank und hochgeladene Fotos wären dann weg.

Damit die Daten dauerhaft bleiben:

1. Im Railway-Projekt → Service → **Settings → Volumes → New Volume**.
2. Mount-Pfad: `/app/data` (für die SQLite-Datei) — für die Fotos zusätzlich
   ein zweites Volume auf `/app/uploads`, oder beides in einem gemeinsamen
   übergeordneten Ordner mounten und `UPLOAD_DIR`/`DATA_DIR` entsprechend
   anpassen, falls gewünscht.
3. Ohne Volume läuft alles trotzdem, ist aber **nicht dauerhaft** –
   für einen Test reicht das, für den echten Partybetrieb sollte ein Volume
   eingerichtet sein.

## CORS

Standardmäßig (`CORS_ORIGIN` leer) sind alle Origins erlaubt – praktisch zum
Testen, aber offen. Für den Produktivbetrieb `CORS_ORIGIN` auf die
GitHub-Pages-Domain setzen.

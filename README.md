# birthday-2026

Felix 18. Geburtstag – Party-Webseite.

- **Frontend** (`index.html`): statische Seite, gehostet über **GitHub Pages**.
- **Backend** (`backend/`): kleine Node.js/Express-API mit **SQLite**-Datenbank
  (`better-sqlite3`), gedacht für **Railway**. Speichert Musikwünsche
  (inkl. Likes) und hochgeladene Fotos dauerhaft in einer echten Datenbank
  statt nur im Browser.

## Setup in 3 Schritten

1. **Backend deployen** – siehe [`backend/README.md`](backend/README.md).
   Ergebnis: eine URL wie `https://<projekt>.up.railway.app`.

2. **Frontend verbinden** – in [`index.html`](index.html) im `<script>`-Block
   die Konstante `API_BASE_URL` auf die Railway-URL setzen:

   ```js
   const API_BASE_URL = "https://<projekt>.up.railway.app";
   ```

3. **CORS erlauben** – im Railway-Projekt die Umgebungsvariable
   `CORS_ORIGIN` auf die eigene GitHub-Pages-URL setzen, z.B.
   `https://<username>.github.io`.

Danach wie gewohnt auf `main` pushen – GitHub Pages baut die Seite automatisch
aus `index.html`.

## Was sich geändert hat

- Musikwünsche werden jetzt in SQLite gespeichert und sind für alle
  Besucher:innen sichtbar (inkl. Like-Zähler, der wirklich persistiert wird).
- Fotos werden beim Hochladen an das Backend geschickt, dort gespeichert und
  unterhalb der Upload-Fläche als Galerie angezeigt (vorher passierte mit
  hochgeladenen Fotos nichts – es gab nur eine Bestätigung).
- Ist das Backend nicht erreichbar (z.B. `API_BASE_URL` noch nicht gesetzt),
  zeigt die Seite einen dezenten Hinweis statt kaputt zu wirken – Design und
  restliche Funktionen bleiben unverändert.

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const db = require("./db");

const PORT = process.env.PORT || 3001;

// Kommagetrennte Liste erlaubter Origins, z.B.
// "https://felix18.github.io,https://felix-birthday-2026.pages.dev"
// Ohne Angabe: alles erlaubt (praktisch zum Testen, für produktiv besser einschränken).
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : true,
  })
);
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = /^\.(jpe?g|png|gif|webp|heic|heif)$/i.test(ext) ? ext : "";
    cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Nur Bilddateien sind erlaubt."));
    }
  },
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

/* ---------- SONGS ---------- */

app.get("/api/songs", (req, res) => {
  const songs = db
    .prepare("SELECT id, text, likes, created_at FROM songs ORDER BY likes DESC, created_at DESC")
    .all();
  res.json(songs);
});

app.post("/api/songs", (req, res) => {
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "Song-Text fehlt." });
  }
  if (text.length > 200) {
    return res.status(400).json({ error: "Song-Text ist zu lang (max. 200 Zeichen)." });
  }

  const result = db
    .prepare("INSERT INTO songs (text, likes) VALUES (?, 0)")
    .run(text);

  const song = db
    .prepare("SELECT id, text, likes, created_at FROM songs WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(song);
});

app.post("/api/songs/:id/like", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Ungültige ID." });
  }

  const existing = db.prepare("SELECT id FROM songs WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Song nicht gefunden." });
  }

  db.prepare("UPDATE songs SET likes = likes + 1 WHERE id = ?").run(id);
  const song = db
    .prepare("SELECT id, text, likes, created_at FROM songs WHERE id = ?")
    .get(id);

  res.json(song);
});

/* ---------- PHOTOS ---------- */

app.get("/api/photos", (req, res) => {
  const photos = db
    .prepare("SELECT id, filename, original_name, uploaded_at FROM photos ORDER BY uploaded_at DESC")
    .all();

  res.json(
    photos.map((p) => ({
      ...p,
      url: `/uploads/${p.filename}`,
    }))
  );
});

app.post("/api/photos", upload.array("photos", 10), (req, res) => {
  const files = req.files || [];

  if (!files.length) {
    return res.status(400).json({ error: "Keine Fotos erhalten." });
  }

  const insert = db.prepare(
    "INSERT INTO photos (filename, original_name) VALUES (?, ?)"
  );

  const saved = files.map((file) => {
    const result = insert.run(file.filename, file.originalname);
    return {
      id: result.lastInsertRowid,
      filename: file.filename,
      original_name: file.originalname,
      url: `/uploads/${file.filename}`,
    };
  });

  res.status(201).json(saved);
});

// Multer-Fehler (z.B. Datei zu groß, falscher Typ) sauber als JSON zurückgeben
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message || "Upload fehlgeschlagen." });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Felix Birthday API läuft auf Port ${PORT}`);
});

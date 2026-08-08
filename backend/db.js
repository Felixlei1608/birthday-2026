const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "party.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed die ursprünglichen Beispiel-Songs, damit die Wishlist beim ersten
// Start genauso aussieht wie vorher im rein statischen Frontend.
const songCount = db.prepare("SELECT COUNT(*) AS n FROM songs").get().n;
if (songCount === 0) {
  const insert = db.prepare(
    "INSERT INTO songs (text, likes) VALUES (?, ?)"
  );
  const seedSongs = [
    ["The Weeknd – Blinding Lights", 12],
    ["One Dance", 9],
    ["The Business", 7],
  ];
  const insertMany = db.transaction((rows) => {
    for (const [text, likes] of rows) insert.run(text, likes);
  });
  insertMany(seedSongs);
}

module.exports = db;

// src/db/store.js
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

/* ---------------------------------------------------------
   0️⃣  Chemin vers le fichier SQLite (créé à la volée si besoin)
   --------------------------------------------------------- */
const dbPath = path.resolve(process.cwd(), "data.sqlite");
const db = new Database(dbPath);

/* ---------------------------------------------------------
   1️⃣  Créer les tables si elles n’existent pas encore
   --------------------------------------------------------- */
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fan_id TEXT NOT NULL,
    fan_name TEXT,
    inbound TEXT,          -- texte reçu du fan
    outbound TEXT,         -- texte envoyé par le bot / IA
    flagged INTEGER,       -- 1 = flaggé (requête hors‑script ou modération)
    ts DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    type TEXT,
    content TEXT,
    conditions TEXT        -- JSON.stringify(array) – on le garde pour de futures règles
  );
`);

/* ---------------------------------------------------------
   2️⃣  Fonction : enregistrer un échange complet (fan ↔ bot/IA)
   --------------------------------------------------------- */
export function logMessage({ fanId, fanName, inbound, outbound, flagged }) {
  const stmt = db.prepare(`
    INSERT INTO messages (fan_id, fan_name, inbound, outbound, flagged)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(fanId, fanName, inbound, outbound, flagged ? 1 : 0);
}

/* ---------------------------------------------------------
   3️⃣  Fonction : récupérer les N derniers messages d’un fan
   --------------------------------------------------------- */
export function getLastMessages(fanId, limit = 10) {
  const stmt = db.prepare(`
    SELECT inbound, outbound, ts
    FROM messages
    WHERE fan_id = ?
    ORDER BY ts DESC
    LIMIT ?
  `);
  const rows = stmt.all(fanId, limit);
  // On renvoie du plus ancien au plus récent (chronologique)
  return rows.reverse();
}

/* ---------------------------------------------------------
   4️⃣  Fonction : charger le fichier JSON de templates et
        les insérer / mettre à jour dans la table `templates`.
        Retourne un objet simple : { greeting: "...", upsell_video: "...", … }
   --------------------------------------------------------- */
export async function loadTemplates() {
  const jsonPath = path.resolve(process.cwd(), "scripts", "default.json");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const templates = JSON.parse(raw);

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO templates (id, type, content, conditions)
    VALUES (?, ?, ?, ?)
  `);

  for (const t of templates) {
    stmt.run(t.id, t.type, t.content, JSON.stringify(t.conditions));
  }

  // Retourner un objet map : id → content (pour un accès rapide)
  const map = {};
  for (const t of templates) {
    map[t.id] = t.content;
  }
  return map;
}


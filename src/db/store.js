import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Ouvrir la connexion SQLite
export async function initDB() {
  const db = await open({
    filename: './data.sqlite',
    driver: sqlite3.Database
  });

  // Créer la table si elle n'existe pas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      last_message TEXT,
      last_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

// Fonction pour obtenir ou créer une conversation
export async function getOrCreateConversation(db, userId) {
  let conversation = await db.get(
    'SELECT * FROM conversations WHERE user_id = ?',
    userId
  );

  if (!conversation) {
    const result = await db.run(
      'INSERT INTO conversations (user_id) VALUES (?)',
      userId
    );
    conversation = await db.get(
      'SELECT * FROM conversations WHERE id = ?',
      result.lastID
    );
  }

  return conversation;
}

// Fonction pour mettre à jour une conversation
export async function updateConversation(db, userId, lastMessage, lastResponse) {
  await db.run(
    'UPDATE conversations SET last_message = ?, last_response = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    lastMessage, lastResponse, userId
  );
}


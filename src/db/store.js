import sqlite3 from 'sqlite3';

// Ouvrir la connexion SQLite
export function initDB() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./data.sqlite', (err) => {
      if (err) {
        reject(err);
      } else {
        // Créer la table si elle n'existe pas
        db.exec(`
          CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            last_message TEXT,
            last_response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve(db);
        });
      }
    });
  });
}

// Fonction pour obtenir ou créer une conversation
export function getOrCreateConversation(db, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM conversations WHERE user_id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else if (row) resolve(row);
        else {
          db.run(
            'INSERT INTO conversations (user_id) VALUES (?)',
            [userId],
            function(err) {
              if (err) reject(err);
              else {
                db.get(
                  'SELECT * FROM conversations WHERE id = ?',
                  [this.lastID],
                  (err, newRow) => {
                    if (err) reject(err);
                    else resolve(newRow);
                  }
                );
              }
            }
          );
        }
      }
    );
  });
}

// Fonction pour mettre à jour une conversation
export function updateConversation(db, userId, lastMessage, lastResponse) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE conversations SET last_message = ?, last_response = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [lastMessage, lastResponse, userId],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}


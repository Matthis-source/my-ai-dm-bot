// src/db/simple-store.js - Base de données mémoire simple
const conversations = new Map();

export async function initDB() {
  console.log("✅ Base de données mémoire initialisée");
  return { conversations };
}

export async function getOrCreateConversation(db, userId) {
  if (!db.conversations.has(userId)) {
    db.conversations.set(userId, {
      user_id: userId,
      last_message: null,
      last_response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    console.log(`✅ Nouvelle conversation créée pour ${userId}`);
  }
  
  const conversation = db.conversations.get(userId);
  return conversation;
}

export async function updateConversation(db, userId, lastMessage, lastResponse) {
  if (db.conversations.has(userId)) {
    const conv = db.conversations.get(userId);
    conv.last_message = lastMessage;
    conv.last_response = lastResponse;
    conv.updated_at = new Date().toISOString();
    console.log(`✅ Conversation mise à jour pour ${userId}`);
  }
}


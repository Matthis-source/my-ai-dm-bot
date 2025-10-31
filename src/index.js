// src/index.js - Version finale corrigée
import './check-env.js'; // Debug des variables

import { launchBrowser, fetchUnreadDMs, sendMessage } from "./connector/onlyfans.js";
import { initDB, getOrCreateConversation, updateConversation } from "./db/simple-store.js";
import { generateResponse } from "./ai/chat.js";
import { notifyDiscord } from "./notifier/discord.js";

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

// Templates simples
const templates = {
  greeting: "Hey there! Thanks for your message. I have some exclusive content you might enjoy.",
  not_allowed: "I'm sorry, I can't respond to that type of message automatically.",
  upsell_video: "I have some private videos you might like! Interested?",
  default: "Thanks for your message! How can I help you today?"
};

/**
 * Traite un DM
 */
async function processDM(page, dm, db) {
  const fanMessage = dm.preview;
  const fanData = {
    fan_name: dm.fanName,
    activity: "exclusive content",
    price: "5"
  };

  try {
    // 1. Récupérer la conversation
    const conversation = await getOrCreateConversation(db, dm.fanId);
    
    // 2. Générer la réponse
    const { text: reply, flagged } = await generateResponse({
      fanMessage,
      fanData,
      history: conversation.last_message ? [conversation.last_message] : [],
      templates,
    });

    console.log(`🤖 Réponse pour ${dm.fanName}: ${reply.substring(0, 50)}...`);

    // 3. Envoyer le message
    await sendMessage(page, dm.fanId, reply);

    // 4. Mettre à jour la base
    await updateConversation(db, dm.fanId, fanMessage, reply);

    // 5. Notifier si flaggé
    if (flagged) {
      console.log(`🚩 Message flaggé pour ${dm.fanName}`);
      await notifyDiscord(`⚠️ Message flaggé de ${dm.fanName}`);
    }

  } catch (err) {
    console.error(`❌ Erreur avec ${dm.fanName}:`, err.message);
  }
}

/**
 * Boucle principale
 */
async function mainLoop() {
  let db;
  let browser;

  try {
    console.log("🔄 Démarrage de la vérification des DMs...");
    
    // Initialiser la DB
    db = await initDB();
    
    // Lancer le navigateur
    const browserInfo = await launchBrowser();
    browser = browserInfo.browser;
    const page = browserInfo.page;

    // Récupérer les DMs non lus
    const unread = await fetchUnreadDMs(page);

    if (unread.length === 0) {
      console.log("✅ Aucun nouveau DM.");
    } else {
      // Traiter chaque DM
      for (const dm of unread) {
        await processDM(page, dm, db);
      }
      console.log(`✅ ${unread.length} DM(s) traités.`);
    }

  } catch (err) {
    console.error("❌ Erreur dans mainLoop:", err.message);
  } finally {
    // Nettoyage
    if (browser) {
      await browser.close();
      console.log("🌐 Navigateur fermé.");
    }
    // Pas de db.close() nécessaire avec la DB mémoire
  }
}

// Gestion des arrêts
process.on('SIGINT', () => {
  console.log('🛑 Arrêt du bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du bot...');
  process.exit(0);
});

// Démarrer
console.log(`🕒 Bot démarré - vérification toutes les ${POLL_INTERVAL_MS / 60000} minutes`);
setInterval(mainLoop, POLL_INTERVAL_MS);

// Premier lancement
setTimeout(mainLoop, 5000);


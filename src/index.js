// src/index.js - VERSION CORRIGÉE
import { launchBrowser, fetchUnreadDMs, sendMessage } from "./connector/onlyfans.js";
import { initDB, getOrCreateConversation, updateConversation } from './db/simple-store.js';
import { generateResponse } from "./ai/chat.js";
import { notifyDiscord } from "./notifier/discord.js";

const POLL_INTERVAL_MS = 2 * 60 * 1000;   // toutes les 2 minutes

// Templates simples (on les met en dur pour l'instant)
const templates = {
  greeting: "Hey there! Thanks for your message. I have some exclusive content you might enjoy.",
  not_allowed: "I'm sorry, I can't respond to that type of message automatically.",
  upsell_video: "I have some private videos you might like! Interested?",
  default: "Thanks for your message! How can I help you today?"
};

/**
 * Traite un DM en utilisant l'IA
 */
async function processDM(page, dm, db) {
  const fanMessage = dm.preview;
  const fanData = {
    fan_name: dm.fanName,
    activity: "a slow tease",
    price: "5"
  };

  try {
    // 1️⃣ Récupérer ou créer la conversation
    const conversation = await getOrCreateConversation(db, dm.fanId);
    
    // 2️⃣ Générer la réponse via l'IA
    const { text: reply, flagged } = await generateResponse({
      fanMessage,
      fanData,
      history: conversation.last_message ? [conversation.last_message] : [],
      templates,
    });

    // 3️⃣ Envoyer la réponse au fan
    await sendMessage(page, dm.fanId, reply);

    // 4️⃣ Mettre à jour la base de données
    await updateConversation(db, dm.fanId, fanMessage, reply);

    console.log(`✅  Réponse envoyée à ${dm.fanName}: ${reply.substring(0, 50)}...`);

    // 5️⃣ Notifier Discord si message flaggé
    if (flagged) {
      await notifyDiscord(
        `⚠️  Message flaggé de **${dm.fanName}** (ID ${dm.fanId}) – nécessite une vérification manuelle.`
      );
    }

  } catch (err) {
    console.error(`❌  Erreur de traitement pour ${dm.fanName}:`, err);
  }
}

/**
 * Boucle principale
 */
async function mainLoop() {
  let db;
  let browser;
  
  try {
    // Initialiser la base de données
    db = await initDB();
    
    // Ouvrir le navigateur
    const browserInfo = await launchBrowser();
    browser = browserInfo.browser;
    const page = browserInfo.page;

    console.log("✅  Connecté à OnlyFans !");

    // Récupérer les DMs non lus
    const unread = await fetchUnreadDMs(page);
    console.log(`📨  ${unread.length} DM(s) non lus récupéré(s).`);

    if (unread.length === 0) {
      console.log("✅  Aucun nouveau DM.");
      return;
    }

    // Traiter chaque DM
    for (const dm of unread) {
      await processDM(page, dm, db);
    }

  } catch (err) {
    console.error("❌  Erreur dans la boucle principale:", err);
  } finally {
    // Fermer les ressources
    if (browser) {
      await browser.close();
    }
    if (db) {
    }
  }
}

// Gérer les arrêts propres
process.on('SIGINT', () => {
  console.log('🛑  Arrêt du bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑  Arrêt du bot...');
  process.exit(0);
});

// Démarrer la boucle
console.log(`🕒  Bot démarré – vérifie les DM toutes les ${POLL_INTERVAL_MS / 60000} minutes.`);
setInterval(mainLoop, POLL_INTERVAL_MS);

// Premier lancement immédiat
mainLoop();


// src/index.js
import { launchBrowser, fetchUnreadDMs, sendMessage } from "./connector/onlyfans.js";
import { logMessage, getLastMessages, loadTemplates } from "./db/store.js";
import { generateResponse } from "./ai/chat.js";
import { notifyDiscord } from "./notifier/discord.js";   // (déjà existant)

const POLL_INTERVAL_MS = 2 * 60 * 1000;   // toutes les 2 minutes

/**
 * Traite un DM en utilisant l’IA (ou le fallback “not_allowed”).
 *
 * @param {puppeteer.Page} page
 * @param {Object} dm   – { fanId, fanName, preview, link }
 * @param {Object} templates – map { greeting: "...", not_allowed: "...", … }
 */
async function processDM(page, dm, templates) {
  const fanMessage = dm.preview;                // texte du fan (court)
  const fanData = {
    fan_name: dm.fanName,
    activity: "a slow tease",                  // à rendre configurable plus tard
    price: "5"
  };

  // 1️⃣ Historique des derniers messages avec ce fan (10 max)
  const history = await getLastMessages(dm.fanId, 10);

  // 2️⃣ Générer la réponse via l’IA (ou le template fallback)
  const { text: reply, flagged } = await generateResponse({
    fanMessage,
    fanData,
    history,
    templates,
  });

  // 3️⃣ Envoyer la réponse au fan
  await sendMessage(page, dm.fanId, reply);

  // 4️⃣ Loguer l’échange dans la base SQLite
  await logMessage({
    fanId: dm.fanId,
    fanName: dm.fanName,
    inbound: fanMessage,
    outbound: reply,
    flagged,
  });

  // 5️⃣ Si le message a été flaggé, notifier sur Discord
  if (flagged) {
    await notifyDiscord(
      `⚠️  Message flaggé de **${dm.fanName}** (ID ${dm.fanId}) – nécessite une revue manuelle.`
    );
  }
}

/* ---------------------------------------------------------
   Boucle principale – vérifie les DM toutes les X minutes
   --------------------------------------------------------- */
async function mainLoop() {
  const { browser, page } = await launchBrowser();

  // Charger les templates (une seule fois, puis ré‑utilisés à chaque tour)
  const templates = await loadTemplates();   // { greeting:"...", upsell_video:"...", not_allowed:"…" }

  const unread = await fetchUnreadDMs(page);
  if (unread.length === 0) {
    console.log("✅  Aucun nouveau DM.");
    await browser.close();
    return;
  }

  for (const dm of unread) {
    try {
      await processDM(page, dm, templates);
    } catch (err) {
      console.error(`❌  Erreur de traitement pour ${dm.fanName}:`, err);
    }
  }

  await browser.close();
}

// Lancer la boucle régulièrement (toutes les 2 minutes)
setInterval(mainLoop, POLL_INTERVAL_MS);
console.log(`🕒  Bot démarré – vérifie les DM toutes les ${POLL_INTERVAL_MS / 60000} minutes.`);


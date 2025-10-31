// src/test-onlyfans.js
import { launchBrowser, fetchUnreadDMs, sendMessage } from "./connector/onlyfans.js";

async function demo() {
  try {
    const { browser, page } = await launchBrowser();

    // 1️⃣ récupérer les DM non lus
    const unread = await fetchUnreadDMs(page);
    console.log("🔎  Détails des DM non lus :", unread);

    // 2️⃣ si on a au moins un DM, on envoie un message de test au premier
    if (unread.length > 0) {
      const first = unread[0];
      await sendMessage(page, first.fanId, "Hello ! Ceci est un message de test depuis mon bot 🤖");
    }

    await browser.close();
    console.log("✅  Démonstration terminée.");
  } catch (err) {
    console.error("❌  Erreur pendant la démonstration :", err);
  }
}

demo();


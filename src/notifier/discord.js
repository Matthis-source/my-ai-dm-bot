// src/notifier/discord.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

/**
 * Envoie une notification vers un webhook Discord
 * @param {string} message - Le message à envoyer
 */
export async function notifyDiscord(message) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  // Si aucun webhook n'est configuré, on ignore silencieusement
  if (!webhookUrl) {
    console.log("ℹ️  Discord webhook non configuré - notification ignorée");
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
    console.log("✅  Notification Discord envoyée");
  } catch (error) {
    console.error("❌  Erreur lors de l'envoi vers Discord:", error.message);
  }
}


// src/test-ai.js
import { loadTemplates } from "./db/store.js";
import { generateResponse } from "./ai/chat.js";

async function demo() {
  // ---------- 1️⃣ Simuler un message de fan ----------
  const fanMessage = "Hey, what private video do you have?";
  const fanData = { fan_name: "Alice", activity: "a slow tease", price: "7" };
  const history = [];                       // aucun historique (premier DM)

  // ---------- 2️⃣ Charger les templates (greeting, upsell_video, not_allowed) ----------
  const templates = await loadTemplates();

  // ---------- 3️⃣ Générer la réponse IA ----------
  const { text, flagged } = await generateResponse({
    fanMessage,
    fanData,
    history,
    templates,
  });

  // ---------- 4️⃣ Afficher le résultat ----------
  console.log("🤖 Réponse IA :", text);
  console.log("🚩 Flaggé ?", flagged);
}

demo();


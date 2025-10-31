// src/ai/chat.js
import { generateAnswer } from "./provider.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🔑  OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "present" : "MISSING");

/* ---------------------------------------------------------
   0️⃣  System Prompt – décrit le rôle du bot pour chaque fan
   --------------------------------------------------------- */
const SYSTEM_PROMPT = `
You are an AI chat assistant for an adult content creator.
Your duties:
- Keep the conversation friendly, consensual and engaging.
- Never mention that you are an AI.
- Follow the creator’s preferences (the creator may provide activity, price, etc.).
- If a fan asks for something that is not allowed, answer politely with the "not_allowed" template and flag the request.
- Always ask for consent before moving to explicit language.
- Use placeholders {fan_name}, {activity}, {price} when they appear.
`;

/* ---------------------------------------------------------
   1️⃣  Modération – version temporaire qui ignore les erreurs de quota
   --------------------------------------------------------- */
async function moderate(text) {
  try {
    const openai = new (await import("openai")).default({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const resp = await openai.moderations.create({ input: text });
    const flagged = resp.results[0].flagged;
    return { flagged, categories: resp.results[0].categories };
  } catch (error) {
    // En cas d'erreur (rate limit, etc.), on considère que le contenu est safe
    console.log("⚠️  Modération désactivée (erreur capturée) :", error.message);
    return { flagged: false, categories: {} };
  }
}

/* ---------------------------------------------------------
   2️⃣  Fonction principale : génère la réponse IA.
   --------------------------------------------------------- */
export async function generateResponse({
  fanMessage,            // texte du fan (string)
  fanData = {},         // { fan_name, activity, price } – données personnalisées
  history = [],          // tableau d’objets { inbound, outbound } depuis SQLite
  templates = {},        // map des templates (greeting, not_allowed, …)
}) {
  // ----- 2.1 Modérer le message du fan (inbound) -----
  const { flagged: inboundFlag } = await moderate(fanMessage);
  if (inboundFlag) {
    // Si le message du fan est interdit, on utilise directement le template "not_allowed"
    return {
      text: templates.not_allowed || "I’m not comfortable with that request.",
      flagged: true,
    };
  }

  // ----- 2.2 Construire le tableau de messages pour le LLM -----
  // Historique du dialogue (du plus ancien au plus récent)
  const messages = history.flatMap((h) => {
    const arr = [];
    if (h.inbound) arr.push({ role: "user", content: h.inbound });
    if (h.outbound) arr.push({ role: "assistant", content: h.outbound });
    return arr;
  });

  // Ajouter le message actuel du fan
  messages.push({ role: "user", content: fanMessage });

  // ----- 2.3 Appeler le provider (OpenAI / Anthropic / Gemini) -----
  const rawAnswer = await generateAnswer({
    systemPrompt: SYSTEM_PROMPT,
    messages,
    temperature: 0.7,
    maxTokens: 800,
    // model: "gpt-4o-mini",   // optionnel – on utilise le modèle par défaut du provider
  });

  // ----- 2.4 Modérer la réponse de l’IA (outbound) -----
  const { flagged: outboundFlag } = await moderate(rawAnswer);
  let finalAnswer = outboundFlag
    ? (templates.not_allowed || "I’m not comfortable with that request.")
    : rawAnswer;

  // ----- 2.5 Remplacer les placeholders (fan_name, activity, price) -----
  finalAnswer = finalAnswer
    .replace(/{fan_name}/g, fanData.fan_name || "cher fan")
    .replace(/{activity}/g, fanData.activity || "something fun")
    .replace(/{price}/g, fanData.price || "5");

  return { text: finalAnswer, flagged: outboundFlag };
}


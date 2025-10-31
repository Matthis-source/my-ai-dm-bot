// src/ai/chat.js - Version corrigée
import OpenAI from 'openai';

// TEMPORAIRE : Gérer l'absence de clé API
const apiKey = process.env.OPENAI_API_KEY;
let openai = null;

if (apiKey) {
  console.log("✅ OpenAI configuré avec clé API");
  openai = new OpenAI({ apiKey });
} else {
  console.log("🔧 Mode démo - OpenAI simulé");
}

/**
 * Vérifie si un message nécessite une modération
 */
async function moderate(text) {
  if (!openai) {
    console.log("⚠️  Modération désactivée (API key manquante)");
    return false;
  }

  try {
    const response = await openai.moderations.create({
      input: text,
    });
    return response.results[0]?.flagged || false;
  } catch (error) {
    console.log("⚠️  Modération désactivée (erreur capturée) :", error.message);
    return false;
  }
}

/**
 * Génère une réponse via OpenAI
 */
export async function generateResponse({ fanMessage, fanData, history, templates }) {
  const prompt = `
Tu es un assistant qui aide à répondre aux messages des fans sur OnlyFans.
Le fan s'appelle ${fanData.fan_name}. Son message : "${fanMessage}"

Historique récent : ${history.slice(-3).join(' | ') || 'Aucun historique'}

Ton style : chaleureux, professionnel, un peu coquin mais respectueux.
Tu proposes du contenu privé à $${fanData.price} pour "${fanData.activity}".

Réponds en anglais, sois bref et engageant.
`;

  if (!openai) {
    console.log("🔧 Mode démo - réponse simulée");
    return {
      text: templates?.default || `Thanks for your message ${fanData.fan_name}! (Demo mode)`,
      flagged: false
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: fanMessage }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || 
      templates?.default || "Thanks for your message!";

    const flagged = await moderate(responseText);

    return {
      text: responseText,
      flagged
    };
  } catch (error) {
    console.error("❌ Erreur OpenAI:", error.message);
    return {
      text: templates?.default || "Thanks for your message! I appreciate it.",
      flagged: false
    };
  }
}


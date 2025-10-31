// src/ai/gemini-chat.js - Google Gemini (gratuit)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Génère une réponse via Gemini
 */
export async function generateResponse({ fanMessage, fanData, history, templates }) {
  const prompt = `
Tu es un assistant qui aide à répondre aux messages des fans sur OnlyFans.

INFORMATIONS :
- Le fan s'appelle ${fanData.fan_name}
- Son message : "${fanMessage}"
- Tu proposes du contenu privé à $${fanData.price}
- Activité : "${fanData.activity}"

HISTORIQUE RÉCENT : ${history.slice(-3).join(' | ') || 'Premier message'}

STYLE DE RÉPONSE :
- En anglais, chaleureux et professionnel
- Bref (1-2 phrases maximum)
- Engageant, pose une question à la fin

RÉPONDRE au message du fan naturellement.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log("🤖 Gemini a généré:", text);

    return {
      text: text || templates?.default || "Thanks for your message!",
      flagged: false
    };
  } catch (error) {
    console.error("❌ Erreur Gemini:", error.message);
    
    // Fallback intelligent
    const message = fanMessage.toLowerCase();
    let fallback = templates?.default || "Thanks for your message!";
    
    if (message.includes('price') || message.includes('cost')) {
      fallback = `The private video is $${fanData.price}! Interested?`;
    } else if (message.includes('video') || message.includes('content')) {
      fallback = `I have exclusive content for $${fanData.price}! Want details?`;
    } else if (message.includes('hello') || message.includes('hi')) {
      fallback = `Hey ${fanData.fan_name}! Thanks for messaging me.`;
    }
    
    return { text: fallback, flagged: false };
  }
}


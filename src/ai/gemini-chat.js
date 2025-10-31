// src/ai/gemini-chat.js - Google Gemini (gratuit)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "free-tier");

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
- Un peu coquin mais respectueux
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
    
    // Fallback intelligent basé sur le message
    const fallback = generateFallbackResponse(fanMessage, fanData, templates);
    return {
      text: fallback,
      flagged: false
    };
  }
}

/**
 * Fallback intelligent si Gemini échoue
 */
function generateFallbackResponse(fanMessage, fanData, templates) {
  const message = fanMessage.toLowerCase();
  
  if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
    return `The private video is $${fanData.price}! Would you like more details?`;
  }
  else if (message.includes('video') || message.includes('content') || message.includes('preview')) {
    return `I have some exclusive content you might enjoy! It's $${fanData.price} - interested?`;
  }
  else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `Hey ${fanData.fan_name}! Thanks for your message. How can I help you today?`;
  }
  else if (message.includes('thank') || message.includes('thanks')) {
    return `You're welcome ${fanData.fan_name}! 😊 Let me know if you have any questions.`;
  }
  else {
    return templates?.default || `Thanks for your message ${fanData.fan_name}! I have some exclusive content available.`;
  }
}


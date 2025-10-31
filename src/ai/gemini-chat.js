// src/ai/gemini-chat.js - Version avec configuration correcte
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuration correcte pour Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateResponse({ fanMessage, fanData, history, templates }) {
  const prompt = `
Tu es un assistant qui aide à répondre aux messages des fans sur OnlyFans.

INFORMATIONS :
- Le fan s'appelle ${fanData.fan_name}
- Son message : "${fanMessage}"
- Tu proposes du contenu privé à $${fanData.price}
- Activité : "${fanData.activity}"

STYLE DE RÉPONSE :
- En anglais, chaleureux et professionnel
- Bref (1-2 phrases maximum)
- Engageant, pose une question à la fin

RÉPONDRE au message du fan naturellement.
`;

  try {
    // Essayer différents modèles et configurations
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.0-pro",  // Modèle plus basique
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log("🤖 Gemini a généré:", text);

    return {
      text: text || templates?.default || "Thanks for your message!",
      flagged: false
    };
  } catch (error) {
    console.error("❌ Erreur Gemini détaillée:", error);
    
    // Fallback ultra simple mais efficace
    const fallback = generateSmartFallback(fanMessage, fanData, templates);
    return { text: fallback, flagged: false };
  }
}

/**
 * Fallback intelligent sans AI
 */
function generateSmartFallback(fanMessage, fanData, templates) {
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
  else if (message.includes('how are you') || message.includes('how you')) {
    return `I'm doing great, thanks for asking ${fanData.fan_name}! How about you?`;
  }
  else {
    return templates?.default || `Thanks for your message ${fanData.fan_name}! I have some exclusive content available.`;
  }
}


// src/test-openai.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // charge les variables du .env

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,   // ← la clé que tu vas mettre dans .env
});

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",           // modèle léger, parfait pour un test
      messages: [
        { role: "system", content: "You are a friendly assistant." },
        { role: "user",   content: "Quelle est la capitale de la France ?" }
      ],
      temperature: 0.5,
    });

    console.log("🟢 Réponse de l’IA :", completion.choices[0].message.content);
  } catch (err) {
    console.error("❌ Erreur OpenAI :", err);
  }
}

main();


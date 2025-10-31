// src/ai/provider.js
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";                // optionnel
import { GoogleGenerativeAI } from "@google/generative-ai"; // optionnel
import dotenv from "dotenv";

dotenv.config();                                          // charge .env

/**
 * Retourne un objet qui encapsule le SDK du provider choisi.
 * Le provider se définit via la variable d’environnement AI_PROVIDER
 * (valeurs acceptées : "openai", "anthropic", "gemini").
 */
function getClient() {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  switch (provider) {
    case "openai":
      return {
        name: "openai",
        client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
        defaultModel: "gpt-4o-mini",
        async call({ model, messages, temperature, maxTokens }) {
          const resp = await this.client.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          });
          return resp.choices[0].message.content.trim();
        },
      };

    case "anthropic":
      return {
        name: "anthropic",
        client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
        defaultModel: "claude-3-opus-20240229",
        async call({ model, messages, temperature, maxTokens }) {
          const resp = await this.client.messages.create({
            model,
            max_tokens: maxTokens,
            temperature,
            messages: messages.map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
          });
          return resp.content[0].text.trim();
        },
      };

    case "gemini":
      return {
        name: "gemini",
        client: new GoogleGenerativeAI(process.env.GEMINI_API_KEY),
        defaultModel: "gemini-1.5-flash",
        async call({ model, messages, temperature, maxTokens }) {
          // Gemini ne supporte pas le format “messages” ; on concatène tout.
          const system = messages.find((m) => m.role === "system")?.content || "";
          const conversation = messages
            .filter((m) => m.role !== "system")
            .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
            .join("\n");
          const fullPrompt = `${system}\n${conversation}`;

          const genModel = this.client.getGenerativeModel({ model });
          const result = await genModel.generateContent({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          });
          const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
          return text?.trim() ?? "";
        },
      };

    default:
      throw new Error(
        `Provider "${provider}" non supporté. Utilise "openai", "anthropic" ou "gemini".`
      );
  }
}

/**
 * Fonction publique qui appelle le provider choisi.
 *
 * @param {Object} opts
 *   - model        (optionnel) : nom du modèle à forcer
 *   - systemPrompt : texte du system‑prompt
 *   - messages     : tableau [{role:"user"/"assistant"/"system", content:string}]
 *   - temperature  : 0‑1 (défaut 0.7)
 *   - maxTokens    : limite de sortie (défaut 800)
 * @returns {Promise<string>} réponse générée par l’IA
 */
export async function generateAnswer({
  model,
  systemPrompt,
  messages,
  temperature = 0.7,
  maxTokens = 800,
}) {
  const client = getClient();
  const modelToUse = model || client.defaultModel;

  // On ajoute le system‑prompt au format attendu
  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

  const answer = await client.call({
    model: modelToUse,
    messages: fullMessages,
    temperature,
    maxTokens,
  });

  return answer;
}


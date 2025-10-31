console.log("=== DEBUG Variables d'environnement ===");
console.log("OPENAI_API_KEY présent:", !!process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY longueur:", process.env.OPENAI_API_KEY?.length);
console.log("ONLYFANS_COOKIES présent:", !!process.env.ONLYFANS_COOKIES);
console.log("ONLYFANS_COOKIES début:", process.env.ONLYFANS_COOKIES?.substring(0, 50));
console.log("Toutes les variables:", Object.keys(process.env));


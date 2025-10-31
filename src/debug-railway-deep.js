// src/debug-railway-deep.js - Debug approfondi
console.log("=== 🔍 DEBUG RAILWAY APPROFONDI ===");

// 1. Test des variables exactes
console.log("1. TEST VARIABLES EXACTES:");
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("ONLYFANS_COOKIES exists:", !!process.env.ONLYFANS_COOKIES);

// 2. Afficher les valeurs complètes (masquées pour la sécurité)
console.log("2. VALEURS COMPLÈTES:");
if (process.env.OPENAI_API_KEY) {
  console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY.length);
  console.log("OPENAI_API_KEY starts with:", process.env.OPENAI_API_KEY.substring(0, 10));
} else {
  console.log("OPENAI_API_KEY: MISSING");
}

if (process.env.ONLYFANS_COOKIES) {
  console.log("ONLYFANS_COOKIES length:", process.env.ONLYFANS_COOKIES.length);
  console.log("ONLYFANS_COOKIES starts with:", process.env.ONLYFANS_COOKIES.substring(0, 20));
} else {
  console.log("ONLYFANS_COOKIES: MISSING");
}

// 3. Lister TOUTES les variables d'environnement
console.log("3. TOUTES LES VARIABLES RAILWAY:");
const allVars = Object.keys(process.env);
console.log("Total variables:", allVars.length);

// Afficher les 20 premières variables
allVars.slice(0, 20).forEach(key => {
  console.log(`  ${key}: ${process.env[key]?.substring(0, 50)}...`);
});

// 4. Chercher les variables avec des noms similaires
console.log("4. VARIABLES SIMILAIRES TROUVÉES:");
const similarVars = allVars.filter(key => 
  key.toLowerCase().includes('openai') || 
  key.toLowerCase().includes('onlyfans') ||
  key.toLowerCase().includes('cookie') ||
  key.toLowerCase().includes('key')
);

similarVars.forEach(key => {
  console.log(`  📌 ${key}: ${process.env[key]?.substring(0, 30)}...`);
});

console.log("=== FIN DU DEBUG ===");


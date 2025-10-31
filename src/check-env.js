// src/check-env.js - Debug des variables d'environnement
console.log("=== 🐛 DEBUG ENVIRONMENT ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("RAILWAY_ENVIRONMENT:", process.env.RAILWAY_ENVIRONMENT);

console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length);
console.log("OPENAI_API_KEY preview:", process.env.OPENAI_API_KEY?.substring(0, 20) + "...");

console.log("ONLYFANS_COOKIES exists:", !!process.env.ONLYFANS_COOKIES);
console.log("ONLYFANS_COOKIES length:", process.env.ONLYFANS_COOKIES?.length);
console.log("ONLYFANS_COOKIES preview:", process.env.ONLYFANS_COOKIES?.substring(0, 50) + "...");

// Lister les variables importantes
console.log("=== IMPORTANT VARIABLES ===");
const importantVars = Object.keys(process.env).filter(key => 
  key.includes('OPENAI') || key.includes('ONLYFANS') || key.includes('RAILWAY') || key.includes('NODE')
);

importantVars.forEach(key => {
  const value = process.env[key];
  console.log(`${key}: ${value ? value.substring(0, 30) + '...' : 'MISSING'}`);
});

export default {};


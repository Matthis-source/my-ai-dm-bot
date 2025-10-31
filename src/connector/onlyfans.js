// src/connector/onlyfans.js - Version corrigée
console.log("🎯 Mode démo amélioré - simulation réaliste OnlyFans");

const simulatedFans = [
  { fanId: "fan_sarah_123", fanName: "Sarah", preview: "Hey, I love your content! Do you have private videos?", link: "https://onlyfans.com/my/chats/fan_sarah_123" },
  { fanId: "fan_mike_456", fanName: "Mike", preview: "What's the price for your exclusive content?", link: "https://onlyfans.com/my/chats/fan_mike_456" }
];

export async function launchBrowser() {
  console.log("⏳ Connexion à OnlyFans...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log("✅ Connecté à OnlyFans !");
  
  return { 
    browser: { close: () => console.log("🌐 Déconnexion") },
    page: {
      goto: async () => { await new Promise(resolve => setTimeout(resolve, 2000)); },
      setCookie: async () => {},
      evaluate: async () => true,
      type: async (selector, text) => {
        console.log(`💬 Envoi: "${text.substring(0, 60)}..."`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
      click: async () => { await new Promise(resolve => setTimeout(resolve, 500)); },
      waitForTimeout: async (ms) => { await new Promise(resolve => setTimeout(resolve, ms)); }
    }
  };
}

export async function fetchUnreadDMs(page) {
  console.log("🔍 Recherche de DMs non lus...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const count = Math.floor(Math.random() * 3);
  const dms = simulatedFans.slice(0, count);
  console.log(`📨 ${dms.length} DM(s) non lu(s) trouvé(s)`);
  return dms;
}

export async function sendMessage(page, fanId, message) {
  console.log(`✉️  Envoi à ${fanId}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`✅ Message envoyé: "${message.substring(0, 80)}..."`);
}


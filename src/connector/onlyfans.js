// src/connector/onlyfans.js - Version simplifiée
import puppeteer from 'puppeteer-core';

// TEMPORAIRE : Mode démo par défaut (contourner problème Railway)
console.log("🔧 Mode démo activé - simulation OnlyFans");

// Fonctions en mode démo (toujours utilisées pour l'instant)
export async function launchBrowser() {
  console.log("🔧 Simulation de connexion OnlyFans");
  return { 
    browser: { close: () => console.log("🌐 Navigateur simulé fermé") },
    page: {
      goto: () => Promise.resolve(),
      setCookie: () => Promise.resolve(),
      evaluate: () => Promise.resolve(true),
      type: () => Promise.resolve(),
      click: () => Promise.resolve(),
      waitForTimeout: () => Promise.resolve()
    }
  };
}

export async function fetchUnreadDMs(page) {
  console.log("🔧 Simulation de récupération de DMs");
  
  // Simuler un délai de chargement
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Retourner des DMs simulés pour tester
  const simulatedDMs = [
    {
      fanId: "demo_fan_1",
      fanName: "Alice",
      preview: "Hey, I love your content!",
      link: "https://onlyfans.com/my/chats/demo_fan_1"
    },
    {
      fanId: "demo_fan_2", 
      fanName: "Bob",
      preview: "Do you have private videos?",
      link: "https://onlyfans.com/my/chats/demo_fan_2"
    }
  ];
  
  console.log(`📨 ${simulatedDMs.length} DM(s) simulé(s) récupéré(s)`);
  return simulatedDMs;
}

export async function sendMessage(page, fanId, message) {
  console.log(`🔧 Simulation d'envoi à ${fanId}: ${message.substring(0, 50)}...`);
  
  // Simuler un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`✅ Message simulé envoyé à ${fanId}`);
}

// NOTE : Quand les variables Railway fonctionneront, on pourra réactiver le mode réel
// en décommentant le code ci-dessous :

/*
// Code pour le mode réel (à activer plus tard)
const cookiesEnv = process.env.ONLYFANS_COOKIES;

if (cookiesEnv) {
  console.log("✅ Cookies présents - mode réel activé");
  
  // Réimplémenter les fonctions réelles ici...
}
*/


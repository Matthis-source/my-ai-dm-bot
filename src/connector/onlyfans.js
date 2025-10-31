// src/connector/onlyfans.js - Mode démo amélioré et réaliste
console.log("🎯 Mode démo amélioré - simulation réaliste OnlyFans");

// Simuler de vrais fans avec des messages variés
const simulatedFans = [
  {
    fanId: "fan_sarah_123",
    fanName: "Sarah",
    preview: "Hey, I love your content! Do you have any private videos?",
    link: "https://onlyfans.com/my/chats/fan_sarah_123"
  },
  {
    fanId: "fan_mike_456", 
    fanName: "Mike",
    preview: "What's the price for your exclusive content?",
    link: "https://onlyfans.com/my/chats/fan_mike_456"
  },
  {
    fanId: "fan_jessica_789",
    fanName: "Jessica",
    preview: "Hi! I'm interested in your private shows 😊",
    link: "https://onlyfans.com/my/chats/fan_jessica_789"
  }
];

/**
 * Simulation réaliste de connexion OnlyFans
 */
export async function launchBrowser() {
  console.log("⏳ Connexion à OnlyFans...");
  
  // Simuler un temps de connexion réaliste
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log("✅ Connecté à OnlyFans ! (simulation réaliste)");
  
  return { 
    browser: { 
      close: () => console.log("🌐 Déconnexion d'OnlyFans")
    },
    page: {
      // Simulation de navigation
      goto: async (url) => {
        console.log(`🌐 Navigation: ${url}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
      
      // Simulation de cookies (rien à faire)
      setCookie: async () => {},
      
      // Simulation d'évaluation JavaScript
      evaluate: async (fn) => {
        // Détecter si c'est pour vérifier la connexion
        if (fn.toString().includes('profile')) {
          return true; // Simuler être connecté
        }
        
        // Détecter si c'est pour récupérer les DMs
        if (fn.toString().includes('chat-list-item') || fn.toString().includes('unread')) {
          // Retourner un nombre aléatoire de DMs (0-3)
          const count = Math.floor(Math.random() * 4);
          if (count === 0) {
            console.log("📨 Aucun DM non lu trouvé");
            return [];
          }
          
          // Sélectionner aléatoirement des fans
          const selectedFans = [];
          for (let i = 0; i < count; i++) {
            const randomFan = simulatedFans[Math.floor(Math.random() * simulatedFans.length)];
            if (!selectedFans.find(f => f.fanId === randomFan.fanId)) {
              selectedFans.push({...randomFan});
            }
          }
          
          console.log(`📨 ${selectedFans.length} DM(s) non lu(s) simulé(s)`);
          return selectedFans;
        }
        
        return true;
      },
      
      // Simulation de frappe au clavier
      type: async (selector, text) => {
        console.log(`💬 Envoi de message: "${text.substring(0, 60)}..."`);
        // Simuler le temps de frappe
        await new Promise(resolve => setTimeout(resolve, 1500));
      },
      
      // Simulation de clic
      click: async (selector) => {
        console.log("🖱️  Clic sur le bouton d'envoi");
        await new Promise(resolve => setTimeout(resolve, 800));
      },
      
      // Simulation d'attente
      waitForTimeout: async (ms) => {
        console.log(`⏰ Attente de ${ms}ms`);
        await new Promise(resolve => setTimeout(resolve, ms));
      }
    }
  };
}

/**
 * Récupération des DMs non lus (simulée)
 */
export async function fetchUnreadDMs(page) {
  console.log("🔍 Recherche de DMs non lus...");
  
  // Simuler le chargement de la page
  await page.goto('https://onlyfans.com/my/chats');
  await page.waitForTimeout(2000);
  
  // Utiliser la fonction evaluate pour simuler la récupération
  const unreadDMs = await page.evaluate(() => {
    // Cette fonction sera interceptée par notre simulateur
    return [];
  });
  
  return unreadDMs;
}

/**
 * Envoi de message (simulé)
 */
export async function sendMessage(page, fanId, message) {
  console.log(`✉️  Préparation de l'envoi à ${fanId}...`);
  
  // Simuler la navigation vers le chat
  await page.goto(`https://onlyfans.com/my/chats/${fanId}`);
  await page.waitForTimeout(1000);
  
  // Simuler la frappe du message
  await page.type('.chat-input textarea', message);
  await page.waitForTimeout(500);
  
  // Simuler l'envoi
  await page.click('.chat-input button[type="submit"]');
  await page.waitForTimeout(1000);
  
  console.log(`✅ Message simulé envoyé à ${fanId}`);
  console.log(`


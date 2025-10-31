// src/connector/onlyfans.js - Mode RÉEL activé
import puppeteer from 'puppeteer-core';

console.log("🚀 Mode RÉEL OnlyFans activé !");

// Utiliser les variables Render
const cookiesEnv = process.env.ONLYFANS_COOKIES;

/**
 * Lance le navigateur avec les cookies OnlyFans
 */
export async function launchBrowser() {
  console.log("🔐 Connexion réelle à OnlyFans...");
  
  let cookies;
  try {
    cookies = JSON.parse(cookiesEnv);
    console.log(`✅ ${cookies.length} cookie(s) parsé(s)`);
  } catch (error) {
    console.error("❌ Erreur de parsing des cookies:", error);
    throw new Error("Format des cookies invalide");
  }

  // Configuration Puppeteer pour Render
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  
  // Définir un viewport réaliste
  await page.setViewport({ width: 1280, height: 720 });
  
  // Définir les cookies
  await page.setCookie(...cookies);
  
  // Aller sur OnlyFans pour vérifier la connexion
  console.log("🌐 Navigation vers OnlyFans...");
  await page.goto('https://onlyfans.com', { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
  
  // Vérifier si on est connecté
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('a[href*="/my/profile"]') !== null ||
           document.querySelector('[data-testid="profile-link"]') !== null;
  });

  if (!isLoggedIn) {
    await browser.close();
    console.error("❌ Connexion échouée - vérifie les cookies");
    throw new Error('Connexion à OnlyFans échouée. Cookies expirés ?');
  }

  console.log('✅ Connecté à OnlyFans !');
  return { browser, page };
}

/**
 * Récupère les DMs non lus
 */
export async function fetchUnreadDMs(page) {
  console.log("📨 Récupération des DMs non lus...");
  
  await page.goto('https://onlyfans.com/my/chats', { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
  
  // Attendre que la liste des chats se charge
  await page.waitForTimeout(3000);
  
  const unreadDMs = await page.evaluate(() => {
    const dms = [];
    
    // Sélecteurs possibles pour les éléments de chat
    const chatSelectors = [
      '.chat-list-item',
      '[data-testid="chat-item"]',
      '.message-list-item',
      '.conversation-item'
    ];
    
    let chatItems = [];
    for (const selector of chatSelectors) {
      chatItems = document.querySelectorAll(selector);
      if (chatItems.length > 0) break;
    }
    
    console.log(`📞 ${chatItems.length} éléments de chat trouvés`);
    
    chatItems.forEach(item => {
      // Chercher un indicateur de message non lu
      const unreadIndicators = [
        item.querySelector('.unread'),
        item.querySelector('.unread-count'),
        item.querySelector('[data-unread]'),
        item.querySelector('.badge')
      ].filter(Boolean);
      
      const hasUnread = unreadIndicators.length > 0 || 
                       item.classList.contains('unread') ||
                       item.getAttribute('data-unread') === 'true';
      
      if (hasUnread) {
        // Extraire les informations du DM
        const nameElem = item.querySelector('.name, .username, [data-testid="user-name"]');
        const previewElem = item.querySelector('.preview, .last-message, .message-preview');
        const linkElem = item.querySelector('a');
        
        if (nameElem && linkElem) {
          const fanName = nameElem.textContent.trim();
          const preview = previewElem ? previewElem.textContent.trim() : 'No preview';
          const href = linkElem.href;
          const fanId = href.split('/').pop() || href.split('/').slice(-2, -1)[0];
          
          dms.push({
            fanId: fanId,
            fanName: fanName,
            preview: preview,
            link: href
          });
        }
      }
    });
    
    return dms;
  });

  console.log(`📨 ${unreadDMs.length} DM(s) non lus récupéré(s)`);
  return unreadDMs;
}

/**
 * Envoie un message à un fan
 */
export async function sendMessage(page, fanId, message) {
  console.log(`✉️  Envoi de message à ${fanId}...`);
  
  await page.goto(`https://onlyfans.com/my/chats/${fanId}`, { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
  
  // Attendre que l'interface de chat se charge
  await page.waitForTimeout(2000);
  
  // Trouver le champ de texte
  const textareaSelectors = [
    'textarea[placeholder*="message"]',
    'textarea[placeholder*="Message"]',
    '.chat-input textarea',
    '[data-testid="message-input"]'
  ];
  
  let textarea = null;
  for (const selector of textareaSelectors) {
    textarea = await page.$(selector);
    if (textarea) break;
  }
  
  if (!textarea) {
    throw new Error('Champ de message non trouvé');
  }
  
  // taper le message
  await textarea.type(message, { delay: 50 });
  
  // Trouver le bouton d'envoi
  const buttonSelectors = [
    'button[type="submit"]',
    'button[aria-label*="send"]',
    '.send-button',
    '[data-testid="send-button"]'
  ];
  
  let sendButton = null;
  for (const selector of buttonSelectors) {
    sendButton = await page.$(selector);
    if (sendButton) break;
  }
  
  if (!sendButton) {
    throw new Error('Bouton d\'envoi non trouvé');
  }
  
  // Cliquer pour envoyer
  await sendButton.click();
  
  // Attendre que le message soit envoyé
  await page.waitForTimeout(2000);
  
  console.log(`✅ Message envoyé à ${fanId}`);
}


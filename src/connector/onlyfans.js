// src/connector/onlyfans.js - Version corrigée pour Render
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
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.setCookie(...cookies);
  
  console.log("🌐 Navigation vers OnlyFans...");
  await page.goto('https://onlyfans.com', { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
  
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('a[href*="/my/profile"]') !== null;
  });

  if (!isLoggedIn) {
    await browser.close();
    console.error("❌ Connexion échouée");
    throw new Error('Connexion à OnlyFans échouée');
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
  
  await page.waitForTimeout(3000);
  
  const unreadDMs = await page.evaluate(() => {
    const dms = [];
    const chatItems = document.querySelectorAll('.chat-list-item');
    
    chatItems.forEach(item => {
      const unreadBadge = item.querySelector('.unread');
      if (unreadBadge) {
        const link = item.querySelector('a');
        const name = item.querySelector('.name');
        const preview = item.querySelector('.preview');
        
        if (link && name) {
          dms.push({
            fanId: link.href.split('/').pop(),
            fanName: name.textContent.trim(),
            preview: preview ? preview.textContent.trim() : 'No preview',
            link: link.href
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
  
  await page.waitForTimeout(2000);
  
  // Taper le message
  await page.type('.chat-input textarea', message, { delay: 50 });
  
  // Envoyer
  await page.click('.chat-input button[type="submit"]');
  await page.waitForTimeout(2000);
  
  console.log(`✅ Message envoyé à ${fanId}`);
}


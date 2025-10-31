// src/connector/onlyfans.js - Version corrigée
import puppeteer from 'puppeteer-core';

// TEMPORAIRE : Contourner le problème Railway
const cookiesEnv = process.env.ONLYFANS_COOKIES;

// Fonctions en mode démo
async function demoLaunchBrowser() {
  console.log("🔧 Mode démo - simulation de connexion OnlyFans");
  return { 
    browser: { close: () => {} },
    page: {
      goto: () => Promise.resolve(),
      setCookie: () => Promise.resolve(),
      evaluate: () => Promise.resolve(true)
    }
  };
}

async function demoFetchUnreadDMs() {
  console.log("🔧 Mode démo - simulation de DMs");
  return [];
}

async function demoSendMessage() {
  console.log("🔧 Mode démo - simulation d'envoi de message");
  return Promise.resolve();
}

// Fonctions en mode réel
async function realLaunchBrowser() {
  let cookies;
  try {
    cookies = JSON.parse(cookiesEnv);
    console.log(`✅ ${cookies.length} cookie(s) parsé(s)`);
  } catch (error) {
    console.error("❌ Erreur de parsing des cookies:", error);
    throw new Error("Format des cookies invalide");
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);
  
  await page.goto('https://onlyfans.com', { waitUntil: 'networkidle2' });
  
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('a[href*="/my/profile"]') !== null;
  });

  if (!isLoggedIn) {
    await browser.close();
    throw new Error('❌ Connexion échouée');
  }

  console.log('✅ Connecté à OnlyFans !');
  return { browser, page };
}

async function realFetchUnreadDMs(page) {
  await page.goto('https://onlyfans.com/my/chats', { waitUntil: 'networkidle2' });
  
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

  console.log(`📨 ${unreadDMs.length} DM(s) non lus récupéré(s).`);
  return unreadDMs;
}

async function realSendMessage(page, fanId, message) {
  await page.goto(`https://onlyfans.com/my/chats/${fanId}`, { waitUntil: 'networkidle2' });
  await page.type('.chat-input textarea', message);
  await page.click('.chat-input button[type="submit"]');
  await page.waitForTimeout(2000);
  console.log(`✅ Message envoyé à ${fanId}`);
}

// Exporter les fonctions appropriées
if (!cookiesEnv) {
  console.log("⚠️  ONLYFANS_COOKIES manquante - mode démo activé");
  export const launchBrowser = demoLaunchBrowser;
  export const fetchUnreadDMs = demoFetchUnreadDMs;
  export const sendMessage = demoSendMessage;
} else {
  console.log("✅ Cookies présents - mode réel activé");
  export const launchBrowser = realLaunchBrowser;
  export const fetchUnreadDMs = realFetchUnreadDMs;
  export const sendMessage = realSendMessage;
}


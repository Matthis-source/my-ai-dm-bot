// src/connector/onlyfans.js - Version corrigée pour Railway
import puppeteer from 'puppeteer-core';

// Utiliser process.env directement
const cookiesEnv = process.env.ONLYFANS_COOKIES;

if (!cookiesEnv) {
  console.error("❌ ONLYFANS_COOKIES manquante dans process.env");
  console.log("Vérifie les variables dans Railway > Variables");
  throw new Error("ONLYFANS_COOKIES manquante");
}

console.log("✅ Cookies chargés depuis process.env");

/**
 * Lance le navigateur avec les cookies OnlyFans
 */
export async function launchBrowser() {
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
  
  // Définir les cookies
  await page.setCookie(...cookies);
  
  // Aller sur OnlyFans pour vérifier la connexion
  await page.goto('https://onlyfans.com', { waitUntil: 'networkidle2' });
  
  // Vérifier si on est connecté
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('a[href*="/my/profile"]') !== null;
  });

  if (!isLoggedIn) {
    await browser.close();
    throw new Error('❌ Impossible de se connecter – les cookies sont peut-être expirés ou incomplets.');
  }

  console.log('✅ Connecté à OnlyFans !');
  return { browser, page };
}

/**
 * Récupère les DMs non lus
 */
export async function fetchUnreadDMs(page) {
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

/**
 * Envoie un message à un fan
 */
export async function sendMessage(page, fanId, message) {
  await page.goto(`https://onlyfans.com/my/chats/${fanId}`, { waitUntil: 'networkidle2' });
  
  await page.type('.chat-input textarea', message);
  await page.click('.chat-input button[type="submit"]');
  await page.waitForTimeout(2000);
  
  console.log(`✅ Message envoyé à ${fanId}`);
}


// src/connector/onlyfans.js - Version avec chrome-aws-lambda
import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

console.log("🚀 Mode RÉEL OnlyFans activé !");

const cookiesEnv = process.env.ONLYFANS_COOKIES;

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

  // Configuration pour Render avec chrome-aws-lambda
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
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

export async function sendMessage(page, fanId, message) {
  console.log(`✉️  Envoi de message à ${fanId}...`);
  
  await page.goto(`https://onlyfans.com/my/chats/${fanId}`, { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
  
  await page.waitForTimeout(2000);
  await page.type('.chat-input textarea', message, { delay: 50 });
  await page.click('.chat-input button[type="submit"]');
  await page.waitForTimeout(2000);
  
  console.log(`✅ Message envoyé à ${fanId}`);
}


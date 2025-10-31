// src/connector/onlyfans.js
import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();                       // charge les variables du fichier .env

const COOKIE_ENV = "ONLYFANS_COOKIES";

/**
 * Lance Chrome (headless), injecte les cookies depuis .env
 * et vérifie que la navigation aboutit bien au tableau de bord.
 *
 * @returns {{browser: puppeteer.Browser, page: puppeteer.Page}}
 * @throws  si les cookies sont absents, expirés ou incorrects
 */
export async function launchBrowser() {
  // -----------------------------------------------------------------
  // 1️⃣  Démarrage du navigateur (headless = true pour la prod)
  // -----------------------------------------------------------------
  const browser = await puppeteer.launch({
    headless: true,                     // passe à false si tu veux voir le navigateur
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // -----------------------------------------------------------------
  // 2️⃣  Charger les cookies depuis la variable d’environnement
  // -----------------------------------------------------------------
  const raw = process.env[COOKIE_ENV];
  if (!raw) {
    throw new Error(
      `⚠️  Variable d’environnement ${COOKIE_ENV} manquante. ` +
      `Ajoute tes cookies dans le fichier .env.`
    );
  }

  // `raw` doit être un tableau JSON ; on le parse alors
  const cookies = JSON.parse(raw);
  await page.setCookie(...cookies);

  // -----------------------------------------------------------------
  // 3️⃣  Vérifier que la navigation nous a bien redirigés
  //     vers le tableau de bord (c’est-à‑dire que les cookies sont valides)
  // -----------------------------------------------------------------
  await page.goto("https://onlyfans.com/dashboard", {
    waitUntil: "networkidle2",
    timeout: 15000,            // 15 s max d’attente
  });

  // Si l’URL contient toujours "/login", les cookies ne fonctionnent pas.
  if (page.url().includes("/login")) {
    await browser.close();
    throw new Error(
      "❌  Impossible de se connecter – les cookies sont peut‑être expirés ou incomplets."
    );
  }

  console.log("✅  Connecté à OnlyFans !");
  return { browser, page };
}

/**
 * Récupère les DM non lus (ou l’ensemble des conversations).
 *
 * @param {puppeteer.Page} page – page déjà authentifiée
 * @returns {Promise<Array<{fanId:string, fanName:string, preview:string, link:string}>>}
 */
export async function fetchUnreadDMs(page) {
  await page.goto("https://onlyfans.com/my/chats", {
    waitUntil: "networkidle2",
  });

  // Attendre le sélecteur qui indique les conversations non lues.
  // (Si aucun DM non lu, le sélecteur n’apparaît pas → on ignore l’erreur.)
  await page.waitForSelector(".chat-list-item.unread", { timeout: 5000 }).catch(() => {});

  const msgs = await page.$$eval(".chat-list-item.unread", (items) => {
    return items.map((el) => ({
      fanName: el.querySelector(".username")?.innerText.trim() || "Unknown",
      fanId: el.getAttribute("data-user-id"),
      preview: el.querySelector(".preview")?.innerText.trim() || "",
      link: el.querySelector("a")?.href,
    }));
  });

  console.log(`📨  ${msgs.length} DM(s) non lus récupéré(s).`);
  return msgs;
}

/**
 * Envoie un texte à un fan.
 *
 * @param {puppeteer.Page} page – page déjà authentifiée
 * @param {string} fanId – identifiant du fan (ex. "12345678")
 * @param {string} text – texte à envoyer
 */
export async function sendMessage(page, fanId, text) {
  await page.goto(`https://onlyfans.com/chat/${fanId}`, {
    waitUntil: "networkidle2",
  });

  // Attendre que le champ de saisie soit présent
  await page.waitForSelector("textarea[name='message']", { timeout: 5000 });

  // Taper le texte (un petit délai pour imiter un humain)
  await page.type("textarea[name='message']", text, { delay: 30 });

  // Cliquer sur le bouton d’envoi
  await page.click("button[data-action='send']");

  // Petite pause afin que le message soit effectivement envoyé
  await page.waitForTimeout(800);
  console.log(`✅  Message envoyé à fanId=${fanId}`);
}


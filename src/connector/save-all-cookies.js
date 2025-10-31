// src/connector/save-all-cookies.js
import puppeteer from "puppeteer";
import fs from "fs";
import path from "node:path";

/**
 * Ouvre OnlyFans, attend que tu te connectes manuellement,
 * puis, dès que tu appuies sur "Enter" dans le terminal,
 * récupère **tous** les cookies et les écrit dans .env.
 */
(async () => {
  const browser = await puppeteer.launch({
    headless: false,                    // on veut voir le navigateur
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  console.log("\n🤖  Ouverture du navigateur – connecte‑toi à OnlyFans (login + 2FA).\n");
  await page.goto("https://onlyfans.com/login", { waitUntil: "networkidle2" });

  console.log("🔒  Une fois connecté·e et sur ton tableau de bord, reviens ici et appuie sur **Enter**…\n");
  // Attend que l'utilisateur tape Enter dans le terminal
  await new Promise((resolve) => process.stdin.once("data", resolve));

  // À ce moment‑là, on considère que la session est active
  const allCookies = await page.cookies();

  // Convertir le tableau de cookies en une chaîne JSON (une seule ligne)
  const json = JSON.stringify(allCookies);

  // Écrire (ou écraser) la ligne ONLYFANS_COOKIES dans .env
  const envPath = path.resolve(process.cwd(), ".env");
  const newLine = `ONLYFANS_COOKIES=${json}\n`;
  fs.writeFileSync(envPath, newLine, { encoding: "utf8" });

  console.log("\n✅  Tous les cookies ont été sauvegardés dans .env !");
  console.log(`🗒️   Ligne .env écrite :\n${newLine}`);

  await browser.close();
})();


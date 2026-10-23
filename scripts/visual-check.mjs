/**
 * Drives the running app in headless Chrome/Edge and saves screenshots of
 * each game state. Dev tool only.
 *
 *   npm run build && npm start            (in one terminal)
 *   node scripts/visual-check.mjs [url] [outDir]
 *
 * Set BROWSER_PATH to override the browser executable.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:3000";
const outDir = process.argv[3] ?? "screenshots";
fs.mkdirSync(outDir, { recursive: true });

const candidates = [
  process.env.BROWSER_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);
const executablePath = candidates.find((p) => fs.existsSync(p));
if (!executablePath) throw new Error("No Chrome/Edge found; set BROWSER_PATH");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

const errors = [];
async function newPage(width, height) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  return page;
}
const shot = (page, name) => page.screenshot({ path: path.join(outDir, `${name}.png`) });
const clickButton = async (page, text) => {
  const handle = await page.waitForFunction(
    (t) =>
      [...document.querySelectorAll("button")].find((b) => {
        const name = (b.getAttribute("aria-label") ?? b.textContent ?? "").trim().toLowerCase();
        return !b.disabled && name.startsWith(t.toLowerCase());
      }),
    { timeout: 8000 },
    text,
  );
  await handle.asElement().click();
};

// Desktop flow
const page = await newPage(1920, 1080);
await page.goto(url, { waitUntil: "networkidle0" });
await sleep(2500);
await shot(page, "01-intro");
await clickButton(page, "Start game");
await sleep(2500);
await shot(page, "02-select-empty");
await clickButton(page, "Nafithromycin,");
await sleep(500);
await shot(page, "03-selected-naf");
await clickButton(page, "Roll");
await sleep(1200);
await shot(page, "04-rolling");
if (process.env.QUICK) {
  await sleep(2100);
  await shot(page, "04b-impact");
  await browser.close();
  process.exit(0);
}
await sleep(2100);
await shot(page, "04b-impact");
await sleep(1500);
await shot(page, "05-result-naf");
await clickButton(page, "Azithromycin,");
await sleep(400);
await clickButton(page, "Roll");
await sleep(2300);
await shot(page, "06-azi-impact");
await sleep(2000);
await shot(page, "07-result-azi");
await clickButton(page, "Pin 2 stood");
await sleep(600);
await shot(page, "08-pin-dialog");
await page.keyboard.press("Escape");
await sleep(400);
await clickButton(page, "Clarithromycin,");
await sleep(300);
await clickButton(page, "Roll");
await sleep(4000);
await shot(page, "09-result-clari-all-three");
await clickButton(page, "Open the coverage board");
await sleep(600);
await shot(page, "10-coverage");

// Tablet and mobile
for (const [w, h, name] of [
  [3840, 2160, "13-kiosk-4k"],
  [1366, 768, "14-laptop"],
  [1024, 1366, "11-tablet"],
  [390, 844, "12-mobile"],
]) {
  const p = await newPage(w, h);
  await p.goto(url, { waitUntil: "networkidle0" });
  await sleep(1500);
  await shot(p, `${name}-intro`);
  await clickButton(p, "Start game");
  await sleep(1500);
  await clickButton(p, "Azithromycin,");
  await clickButton(p, "Roll");
  await sleep(4000);
  await p.screenshot({ path: path.join(outDir, `${name}-result.png`), fullPage: true });
  const overflow = await p.evaluate(() => ({
    x: document.documentElement.scrollWidth - window.innerWidth,
    y: document.documentElement.scrollHeight - window.innerHeight,
  }));
  console.log(`${name}: overflow x ${overflow.x}px, y ${overflow.y}px`);
}

await browser.close();
console.log(errors.length ? `Console issues:\n${errors.join("\n")}` : "No console errors or warnings");

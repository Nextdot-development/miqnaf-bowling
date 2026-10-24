import puppeteer from "puppeteer-core";
import fs from "node:fs";

const url = process.argv[2] ?? "http://localhost:3000";
const executablePath = [
  process.env.BROWSER_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => p && fs.existsSync(p));
if (!executablePath) throw new Error("No Chrome/Edge found; set BROWSER_PATH");

/** 42" 16:9 panel at 1080p and 4K, full-screen and inside a browser window. */
const VIEWPORTS = [
  [1920, 1080, "1080p full screen"],
  [1920, 960, "1080p in a browser window"],
  [1920, 880, "1080p, browser + taskbar"],
  [3840, 2160, "4K full screen"],
  [3840, 1960, "4K in a browser window"],
  // Windows display scaling shrinks the CSS viewport of the same panel.
  [1536, 864, "1080p at 125% scaling, full screen"],
  [1536, 730, "1080p at 125% scaling, browser window"],
  [1280, 620, "1080p at 150% scaling, browser window"],
  [1280, 720, "1080p at 150% scaling, full screen"],
  [1097, 617, "1080p at 175% scaling, full screen"],
  [960, 540, "1080p at 200% scaling, full screen"],
  [960, 470, "1080p at 200% scaling, browser window"],
  [2560, 1440, "4K at 150% scaling, full screen"],
  [1920, 1080, "4K at 200% scaling, full screen"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Every page or panel whose content is taller than its box. */
async function overflowing(page) {
  return page.evaluate(() => {
    const out = [];
    const doc = document.documentElement;
    if (doc.scrollHeight - window.innerHeight > 1) out.push(`page +${doc.scrollHeight - window.innerHeight}px`);
    if (doc.scrollWidth - window.innerWidth > 1) out.push(`page sideways +${doc.scrollWidth - window.innerWidth}px`);
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      if (!/(auto|scroll)/.test(s.overflowY)) continue;
      const extra = el.scrollHeight - el.clientHeight;
      if (extra > 1 && el.clientHeight > 0) {
        const name = el.getAttribute("aria-label") || el.closest("[aria-label]")?.getAttribute("aria-label") || el.className.toString().slice(0, 40);
        out.push(`${name} +${extra}px`);
      }
    }
    return out;
  });
}

async function clickButton(page, text) {
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
}

async function swipeRoll(page) {
  const box = await (await page.waitForSelector('[aria-label^="Roll the ball"]:not([disabled])')).boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(x, y - i * 25);
  await page.mouse.up();
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

let problems = 0;
for (const [w, h, label] of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  // Reduced motion: every roll resolves instantly, so the walk is quick.
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(url, { waitUntil: "networkidle0" });
  await sleep(800);

  const results = [];
  const check = async (state) => {
    await sleep(450);
    const o = await overflowing(page);
    results.push([state, o]);
    problems += o.length;
  };

  await check("intro");
  await clickButton(page, "Start game");
  await check("pick a ball (none selected)");
  await clickButton(page, "Azithromycin,");
  await check("pick a ball (selected)");
  await swipeRoll(page);
  await check("result: azithromycin (3 standing + prompt)");
  await clickButton(page, "Pin 2 stood");
  await check("pathogen card");
  await page.keyboard.press("Escape");
  await sleep(300);
  await clickButton(page, "Choose another ball");
  await clickButton(page, "Nafithromycin,");
  await swipeRoll(page);
  await check("result: nafithromycin (8 down)");
  await clickButton(page, "Choose another ball");
  await clickButton(page, "Clarithromycin,");
  await check("pick a ball (with rolled badges)");
  await swipeRoll(page);
  await check("result: all three rolled (board suggestion)");
  await clickButton(page, "Open the coverage board");
  await check("coverage board: session");
  await page.click('[role="radio"]:not([aria-checked="true"])');
  await check("coverage board: full reference");
  await clickButton(page, "New game");
  await check("new game dialog");

  console.log(`\n${label} (${w}×${h})`);
  for (const [state, o] of results) console.log(`  ${o.length ? "✗" : "✓"} ${state}${o.length ? ": " + o.join("; ") : ""}`);
  await page.close();
}

await browser.close();
console.log(problems ? `\n${problems} overflow(s) found` : "\nEverything fits without scrolling");
process.exit(problems ? 1 : 0);

// 42" 16:9 touch panel audit: every screen at 1080p and 4K, 100-200% Windows scaling.
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const [, , url, out, only] = process.argv;
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));
const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// [CSS width, CSS height, device pixel ratio, name]. Panel is 37.5" wide.
const MODES = [
  [390, 844, 3, 'phone'],
  [844, 390, 3, 'phone-land'],
  [768, 1024, 2, 'tablet'],
  [1024, 768, 2, 'tablet-land'],
  [1280, 800, 1, 'laptop-s'],
  [1366, 768, 1, 'laptop'],
  [1536, 864, 1.25, 'laptop-125'],
  [1920, 1080, 1, 'desktop'],
  [2560, 1440, 1, 'qhd'],
  [2560, 1080, 1, 'ultrawide'],
  [3840, 2160, 1, '4k'],
].filter(([, , , n]) => !only || only.split(",").includes(n));

const check = (p, physPxPerCssPx, inchPerPhysPx) =>
  p.evaluate(
    (k, ipp) => {
      const issues = [];
      const vw = innerWidth;
      const vh = innerHeight;
      const vis = (e) => {
        if (!e) return false;
        const s = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        return s.display !== "none" && s.visibility !== "hidden" && +s.opacity > 0.05 && r.width > 0 && r.height > 0;
      };
      if (document.documentElement.scrollWidth > vw + 1) issues.push(`h-overflow ${document.documentElement.scrollWidth - vw}px`);
      if (document.documentElement.scrollHeight > vh + 1) issues.push(`page scrolls ${document.documentElement.scrollHeight - vh}px`);
      const dialog = [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
      if (dialog) {
        const d = dialog.getBoundingClientRect();
        if (d.top < -1 || d.bottom > vh + 1) issues.push("pop-up off screen");
        if (dialog.scrollHeight > dialog.clientHeight + 2) issues.push(`pop-up scrolls ${dialog.scrollHeight - dialog.clientHeight}px`);
      }
      // Smallest text on the top layer, as physical height on the 42" panel (mm).
      const root = dialog ?? document.body;
      let min = 1e9;
      let minText = "";
      for (const e of root.querySelectorAll("p,span,h1,h2,h3,li,button,label,td,th,input")) {
        if (!vis(e) || e.closest(".sr-only")) continue;
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || e.tagName === "INPUT";
        if (!own) continue;
        const fs = parseFloat(getComputedStyle(e).fontSize);
        if (fs < min) {
          min = fs;
          minText = (e.textContent || e.placeholder || "").trim().slice(0, 28);
        }
      }
      const mm = min * k * ipp * 25.4;
      if (min < 1e9 && mm < 3.0) issues.push(`small text ${mm.toFixed(1)}mm "${minText}"`);
      // Touch targets (physical size).
      for (const e of root.querySelectorAll("button")) {
        if (!vis(e) || e.closest('[aria-hidden="true"]') || e.classList.contains("pin-chip")) continue;
        const r = e.getBoundingClientRect();
        const w = r.width * k * ipp * 25.4;
        const h = r.height * k * ipp * 25.4;
        if (Math.min(w, h) < 10) {
          issues.push(`small button ${w.toFixed(0)}x${h.toFixed(0)}mm "${(e.getAttribute("aria-label") ?? e.textContent).trim().slice(0, 20)}"`);
          break;
        }
      }
      if (!dialog) {
        const box = (sel) => {
          const e = document.querySelector(sel);
          return vis(e) ? e.getBoundingClientRect() : null;
        };
        const ov = (a, c) => a && c && !(a.right <= c.left + 1 || c.right <= a.left + 1 || a.bottom <= c.top + 1 || c.bottom <= a.top + 1);
        const rack = box('[aria-labelledby="ball-rack-heading"]');
        const key = box('[aria-labelledby="pin-key-heading"]');
        const trans = box('[aria-labelledby="transition-heading"]');
        const promptEl = [...document.querySelectorAll("[data-lane-card]")].find(vis);
        const card = promptEl ? promptEl.getBoundingClientRect() : null;
        const tags = [...document.querySelectorAll('button[aria-label^="Pin "]')].filter(vis).map((t) => t.getBoundingClientRect());
        const stage = box(".lane-stage");
        if (ov(rack, key)) issues.push("ball panel overlaps pin list");
        if (ov(rack, card)) issues.push("ball panel overlaps lane card");
        if (ov(key, card)) issues.push("pin list overlaps lane card");
        if (ov(trans, key) || ov(trans, rack)) issues.push("transition card overlaps a panel");
        if (card && tags.some((t) => ov(card, t))) issues.push("lane card covers a pin tag");
        if (rack && tags.some((t) => ov(rack, t))) issues.push("ball panel covers a pin tag");
        if (key && tags.some((t) => ov(key, t))) issues.push("pin list covers a pin tag");
        const ball = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") ?? "").startsWith("Roll the ball"));
        if (stage && ball && vis(ball)) {
          const r = ball.getBoundingClientRect();
          if (r.top + r.height / 2 + r.height / 2.3 > stage.bottom + 1) issues.push("ball cut off at the bottom");
        }
        const footer = box('[data-testid="disclaimer"]');
        if (!footer || footer.bottom > vh + 1) issues.push("footer cut off");
      }
      return issues.length ? issues.join("; ") : "ok";
    },
    physPxPerCssPx,
    inchPerPhysPx,
  );

for (const [w, h, dpr, name] of MODES) {
  const p = await b.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr, hasTouch: true });
  await p.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
  await sleep(1500);
  // Physical pixels: 1080p panel has 1920 across 37.5"; 4K has 3840.
  const physW = w * dpr;
  const inchPerPhysPx = 1 / 96 / dpr; void physW;
  const shot = async (stage) => {
    console.log(`${name.padEnd(13)} ${stage.padEnd(10)} ${await check(p, dpr, inchPerPhysPx)}`);
    await p.screenshot({ path: `${out}/r-${name}-${stage}.png` });
  };
  const click = async (t) => {
    await p.waitForFunction((t) => [...document.querySelectorAll("button")].some((x) => x.offsetParent && !x.disabled && x.textContent.trim().toLowerCase().startsWith(t)), { timeout: 60000 }, t);
    await p.evaluate((t) => [...document.querySelectorAll("button")].find((x) => x.offsetParent && !x.disabled && x.textContent.trim().toLowerCase().startsWith(t)).click(), t);
    await sleep(800);
  };
  const roll = () => p.evaluate(() => [...document.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") ?? "").startsWith("Roll the ball")).click());
  await shot("welcome");
  await click("start game");
  for (const k of ["A", "s", "h", "a"]) await p.evaluate((k) => document.querySelector(`[aria-label="On-screen keyboard"] button[aria-label="${k}"]`).click(), k);
  await shot("name");
  await click("continue");
  await shot("greet");
  await click("choose your therapy");
  await shot("choose");
  await p.evaluate(() => document.querySelector('[aria-labelledby="ball-rack-heading"] button').click());
  await sleep(1200);
  await shot("ready");
  await roll();
  await p.waitForFunction(() => document.body.innerText.includes("Would you like another chance?"), { timeout: 60000 });
  await sleep(900);
  await shot("attempt");
  await click("throw the ball");
  await shot("second");
  await roll();
  await p.waitForSelector("#transition-heading", { timeout: 60000 });
  await sleep(3200);
  await shot("transition");
  await click("novel therapy challenge");
  await sleep(1000);
  await shot("f2-ready");
  await roll();
  await p.waitForFunction(() => /all 10 pins down/i.test(document.body.innerText), { timeout: 60000 });
  await sleep(1300);
  await shot("strike");
  await click("see results");
  await shot("scorecard");
  await click("continue");
  await shot("closing");
  await p.evaluate(() => [...document.querySelectorAll("[role=dialog] button")].find((x) => /new game/i.test(x.textContent)).click());
  await sleep(1500);
  console.log(name, "back to welcome:", await p.evaluate(() => /start game/i.test(document.body.innerText)));
  console.log(`${name.padEnd(13)} console errors: ${errors.length ? errors.join(" | ").slice(0, 300) : "none"}`);
  await p.close();
}
await b.close();

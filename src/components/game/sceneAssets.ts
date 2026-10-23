/**
 * Procedural textures and geometry for the bowling scene. Everything is
 * generated locally from canvas and math, so no models or images load over
 * the network. Client-only (uses document).
 */
import * as THREE from "three";
import { SCENE } from "@/lib/brand";
import { PIN_HEIGHT, PIN_MAX_RADIUS, PIN_PROFILE } from "@/lib/laneLayout";

/** Deterministic PRNG so the lane looks identical on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { c, ctx };
}

/** Maple lane boards with grain, running along the lane (canvas y axis). */
export function createWoodTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 2048;
  const { c, ctx } = canvas(W, H);
  const rand = mulberry32(39);
  const boards = 26;
  const bw = W / boards;

  for (let b = 0; b < boards; b++) {
    const x0 = b * bw;
    const hue = 29 + rand() * 6;
    const light = 60 + rand() * 9;
    const sat = 58 + rand() * 14;
    ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
    ctx.fillRect(x0, 0, bw + 1, H);

    // Long grain streaks.
    for (let g = 0; g < 14; g++) {
      const gx = x0 + rand() * bw;
      const amp = 0.6 + rand() * 1.6;
      const freq = 0.002 + rand() * 0.006;
      const phase = rand() * Math.PI * 2;
      ctx.strokeStyle = `hsla(${hue - 4} ${sat + 8}% ${light - 18 - rand() * 12}% / ${0.12 + rand() * 0.2})`;
      ctx.lineWidth = 0.6 + rand() * 1.4;
      ctx.beginPath();
      for (let y = 0; y <= H; y += 16) {
        const px = gx + Math.sin(y * freq + phase) * amp;
        if (y === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
    }

    // Occasional board joints along the length.
    const joints = 1 + Math.floor(rand() * 2);
    for (let j = 0; j < joints; j++) {
      const jy = rand() * H;
      ctx.fillStyle = "rgba(90, 55, 25, 0.35)";
      ctx.fillRect(x0, jy, bw, 1.5);
    }

    // Seam between boards.
    ctx.fillStyle = "rgba(95, 60, 28, 0.45)";
    ctx.fillRect(x0, 0, 1.2, H);
  }

  // Fine speckle so the surface does not look flat under the clearcoat.
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 10;
    img.data[i] = Math.min(255, Math.max(0, img.data[i]! + n));
    img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1]! + n));
    img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2]! + n));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/** Pin skin: white with two red neck stripes (v = height fraction). */
export function createPinTexture(): THREE.CanvasTexture {
  const H = 512;
  const { c, ctx } = canvas(16, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 16, H);
  ctx.fillStyle = SCENE.pinStripe;
  const band = (from: number, to: number) => ctx.fillRect(0, (1 - to) * H, 16, (to - from) * H);
  band(0.655, 0.675);
  band(0.69, 0.71);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Subtle marbling, multiplied with the ball's brand colour. */
export function createBallTexture(seed: number): THREE.CanvasTexture {
  const S = 512;
  const { c, ctx } = canvas(S, S / 2);
  const rand = mulberry32(seed);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, S, S / 2);
  ctx.filter = "blur(6px)";
  for (let i = 0; i < 40; i++) {
    const shade = 200 + Math.floor(rand() * 55);
    ctx.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, ${0.25 + rand() * 0.35})`;
    ctx.lineWidth = 6 + rand() * 18;
    ctx.beginPath();
    let x = rand() * S;
    let y = rand() * (S / 2);
    ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (rand() - 0.5) * 160;
      y += (rand() - 0.5) * 90;
      ctx.quadraticCurveTo(x + (rand() - 0.5) * 80, y + (rand() - 0.5) * 80, x, y);
    }
    ctx.stroke();
  }
  ctx.filter = "none";
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** Dashed outline marking where a fallen pin stood. */
export function createSpotTexture(): THREE.CanvasTexture {
  const S = 128;
  const { c, ctx } = canvas(S, S);
  ctx.strokeStyle = "rgba(55, 35, 15, 0.9)";
  ctx.lineWidth = 8;
  ctx.setLineDash([12, 9]);
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Pin profile as a lathe. Points are sampled at even heights so the lathe's
 * v coordinate equals height fraction (lets the stripe texture line up).
 */
export function createPinGeometry(): THREE.LatheGeometry {
  const curve = new THREE.SplineCurve(PIN_PROFILE.map(([h, r]) => new THREE.Vector2(h, r)));
  const dense = curve.getPoints(400);
  const radiusAt = (h: number) => {
    for (let i = 1; i < dense.length; i++) {
      const a = dense[i - 1]!;
      const b = dense[i]!;
      if (h <= b.x) {
        const t = b.x === a.x ? 0 : (h - a.x) / (b.x - a.x);
        return Math.max(0, a.y + (b.y - a.y) * t);
      }
    }
    return 0;
  };

  const N = 90;
  const points: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= N; i++) {
    const h = i / N;
    points.push(new THREE.Vector2(radiusAt(h) * PIN_MAX_RADIUS, h * PIN_HEIGHT));
  }
  return new THREE.LatheGeometry(points, 40);
}

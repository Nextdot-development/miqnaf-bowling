"use client";

import { useEffect, useRef } from "react";
import { BRAND } from "@/lib/brand";

const COLORS = [BRAND.red, BRAND.navy, BRAND.gold, "#ffffff"];
const PIECES = 220;
const DURATION_MS = 5000;

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  spin: number;
  angle: number;
  wobble: number;
  color: string;
}


export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const scale = Math.max(1, W / 1200);
    const pieces: Piece[] = Array.from({ length: PIECES }, (_, i) => {
      const left = i % 2 === 0;
      const speed = (9 + Math.random() * 14) * scale;
      // Aim up and in towards the middle of the screen.
      const angle = ((left ? -58 : -122) + (Math.random() - 0.5) * 50) * (Math.PI / 180);
      return {
        x: left ? 0 : W,
        y: H * 0.85,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 1.4,
        w: (7 + Math.random() * 7) * scale,
        h: (10 + Math.random() * 10) * scale,
        spin: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI,
        wobble: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      };
    });

    const t0 = performance.now();
    let last = t0;
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.7);
      last = now;
      const fade = Math.min(1, Math.max(0, (DURATION_MS - (now - t0)) / 800));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = fade;
      for (const p of pieces) {
        p.vy += 0.32 * scale * dt;
        p.vx *= 0.985;
        p.vy = Math.min(p.vy, 5 * scale);
        p.wobble += 0.12 * dt;
        p.x += (p.vx + Math.sin(p.wobble) * 1.2) * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(1, Math.cos(p.wobble)); // flutter
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (now - t0 < DURATION_MS) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60] h-full w-full" aria-hidden />;
}

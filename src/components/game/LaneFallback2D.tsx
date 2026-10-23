"use client";

import { useEffect, useMemo, useRef } from "react";
import { PINS } from "@/data/gameData";
import { SCENE } from "@/lib/brand";
import { ballColor } from "@/lib/drugVisuals";
import { pinStatus } from "@/lib/gameLogic";
import {
  ARROWS_Z,
  BALL_RADIUS,
  DECK_END_Z,
  FOUL_LINE_Z,
  GUTTER_WIDTH,
  LANE_HALF_WIDTH,
  LANE_NEAR_Z,
  PIN_HEIGHT,
  PIN_MAX_RADIUS,
  PIN_PROFILE,
  pinPosition,
} from "@/lib/laneLayout";
import { createProjector, type Projector } from "@/lib/projection";
import { ballPose, fallDirection, pinPose } from "@/lib/rollAnimation";
import { useElementSize } from "@/hooks/useElementSize";
import type { BowlingSceneProps } from "./BowlingScene";

/** SVG path for a pin of pixel height h, base at (0,0), growing upwards. */
function pinPath(h: number): string {
  const w = (PIN_MAX_RADIUS / PIN_HEIGHT) * h;
  const right = PIN_PROFILE.map(([t, r]) => `${(r * w).toFixed(2)},${(-t * h).toFixed(2)}`);
  const left = [...PIN_PROFILE].reverse().map(([t, r]) => `${(-r * w).toFixed(2)},${(-t * h).toFixed(2)}`);
  return `M${right.join(" L")} L${left.join(" L")} Z`;
}

function quad(p: Projector, x0: number, x1: number, zNear: number, zFar: number, y = 0) {
  return [p(x0, y, zNear), p(x1, y, zNear), p(x1, y, zFar), p(x0, y, zFar)]
    .map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`)
    .join(" ");
}

type FallbackProps = Pick<BowlingSceneProps, "phase" | "ballDrug" | "outcomeDrug" | "rollStartedAt">;

/**
 * 2D lane used when WebGL is unavailable and while the 3D scene loads.
 * Same layout, timeline and outcome helpers as the 3D scene.
 */
export function LaneFallback2D({
  phase,
  ballDrug,
  outcomeDrug,
  rollStartedAt,
}: FallbackProps) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const ballRef = useRef<SVGGElement>(null);
  const pinRefs = useRef<(SVGGElement | null)[]>([]);

  const project = useMemo(() => (width && height ? createProjector(width, height) : null), [width, height]);

  const showingOutcome = (phase === "rolling" || phase === "result") && outcomeDrug !== null;
  const falls = (n: (typeof PINS)[number]["number"]) =>
    showingOutcome && pinStatus(outcomeDrug, n) === "down";

  // Frame loop: writes SVG attributes directly, no React renders per frame.
  useEffect(() => {
    if (!project) return;
    let raf = 0;
    const draw = () => {
      const elapsed =
        phase === "result"
          ? Number.POSITIVE_INFINITY
          : phase === "rolling" && rollStartedAt !== null
            ? performance.now() - rollStartedAt
            : 0;

      const b = ballPose(elapsed);
      const bc = project(b.x, b.y, b.z);
      const br = Math.abs(project(b.x, b.y + BALL_RADIUS, b.z).y - bc.y);
      if (ballRef.current) {
        ballRef.current.setAttribute("transform", `translate(${bc.x} ${bc.y}) scale(${br})`);
        ballRef.current.style.opacity = b.visible && b.y > -0.05 ? "1" : "0";
      }

      PINS.forEach((pin, i) => {
        const g = pinRefs.current[i];
        if (!g) return;
        const { x, z } = pinPosition(pin.number);
        const pose = pinPose(pin.number, falls(pin.number), elapsed);
        const base = project(x + pose.dx, 0, z + pose.dz);
        const dir = fallDirection(pin.number);
        const rot = (pose.angle * 180) / Math.PI * (pose.dim > 0 || !falls(pin.number) ? 1 : dir.x);
        const squash = 1 - 0.7 * Math.sin(pose.angle) * Math.abs(dir.z) * (falls(pin.number) ? 1 : 0);
        g.setAttribute("transform", `translate(${base.x} ${base.y}) rotate(${rot.toFixed(2)}) scale(1 ${squash.toFixed(3)})`);
        g.style.opacity = String(pose.opacity);
        g.style.filter = pose.dim > 0 ? `grayscale(1) brightness(${1 - 0.22 * pose.dim})` : "";
      });

      if (phase === "rolling") raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, phase, rollStartedAt, outcomeDrug]);

  const color = ballColor(ballDrug);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" data-testid="lane-2d">
      {project && (
        <svg width={width} height={height} className="absolute inset-0" aria-hidden>
          <defs>
            <linearGradient id="wood2d" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#d9a466" />
              <stop offset="0.6" stopColor="#e8c08a" />
              <stop offset="1" stopColor="#f5dfba" />
            </linearGradient>
            <radialGradient id="ball2d" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="0.35" stopColor={color} stopOpacity="1" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.55" />
            </radialGradient>
          </defs>
          <polygon
            points={quad(project, -LANE_HALF_WIDTH - GUTTER_WIDTH - 0.3, LANE_HALF_WIDTH + GUTTER_WIDTH + 0.3, LANE_NEAR_Z, DECK_END_Z)}
            fill={SCENE.gutter}
          />
          <polygon points={quad(project, -LANE_HALF_WIDTH, LANE_HALF_WIDTH, LANE_NEAR_Z, DECK_END_Z)} fill="url(#wood2d)" />
          {Array.from({ length: 13 }, (_, i) => {
            const x = -LANE_HALF_WIDTH + (i + 1) * ((LANE_HALF_WIDTH * 2) / 14);
            const a = project(x, 0, LANE_NEAR_Z);
            const b = project(x, 0, DECK_END_Z);
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a8743f" strokeOpacity="0.35" strokeWidth="1" />;
          })}
          <polygon points={quad(project, -LANE_HALF_WIDTH, LANE_HALF_WIDTH, FOUL_LINE_Z + 0.01, FOUL_LINE_Z - 0.01)} fill="#5a3a1c" />
          {[-3, -2, -1, 0, 1, 2, 3].map((i) => {
            const z = ARROWS_Z - Math.abs(i) * 0.16;
            const tip = project(i * 0.205, 0, z - 0.07);
            const l = project(i * 0.205 - 0.028, 0, z + 0.05);
            const r = project(i * 0.205 + 0.028, 0, z + 0.05);
            return <polygon key={i} points={`${tip.x},${tip.y} ${l.x},${l.y} ${r.x},${r.y}`} fill="#86552a" />;
          })}

          {/* Rear row first so the front row overlaps it. */}
          {[...PINS]
            .map((pin, i) => ({ pin, i }))
            .sort((a, b) => (a.pin.row === b.pin.row ? 0 : a.pin.row === "rear" ? -1 : 1))
            .map(({ pin, i }) => {
              const { x, z } = pinPosition(pin.number);
              const base = project(x, 0, z);
              const h = base.y - project(x, PIN_HEIGHT, z).y;
              const spot = phase === "result" && falls(pin.number);
              return (
                <g key={pin.number}>
                  {spot && (
                    <ellipse cx={base.x} cy={base.y} rx={h * 0.32} ry={h * 0.11} fill="none" stroke="#5b3b1d" strokeDasharray="4 3" strokeWidth="1.5" />
                  )}
                  <g
                    ref={(el) => {
                      pinRefs.current[i] = el;
                    }}
                    transform={`translate(${base.x} ${base.y})`}
                  >
                    <path d={pinPath(h)} fill={SCENE.pinWhite} stroke="#b9bccb" strokeWidth="0.8" />
                    <rect x={-h * 0.08} y={-h * 0.675} width={h * 0.16} height={h * 0.02} fill={SCENE.pinStripe} />
                    <rect x={-h * 0.08} y={-h * 0.71} width={h * 0.16} height={h * 0.02} fill={SCENE.pinStripe} />
                  </g>
                </g>
              );
            })}

          <g ref={ballRef}>
            <circle r="1" fill="url(#ball2d)" />
            <circle cx="-0.25" cy="-0.45" r="0.1" fill="#111" />
            <circle cx="0.25" cy="-0.45" r="0.1" fill="#111" />
            <circle cx="0" cy="-0.15" r="0.12" fill="#111" />
          </g>
        </svg>
      )}

    </div>
  );
}

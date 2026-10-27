"use client";

import { CONVENTIONAL_BALLS, DRUGS } from "@/data/gameData";
import { BALL_RADIUS, BALL_START_Z, introBallX } from "@/lib/laneLayout";
import { createProjector } from "@/lib/projection";

/** Name tags under the balls lined up on the intro lane. */
export function BallLabels({ width, height }: { width: number; height: number }) {
  if (!width || !height) return null;
  const project = createProjector(width, height);
  // Tags never wider than the gap between neighbouring balls.
  const gap = Math.abs(project(introBallX(1, 2), 0, BALL_START_Z).x - project(introBallX(0, 2), 0, BALL_START_Z).x);

  return (
    <ul className="pointer-events-none absolute inset-0 z-10" aria-label="The balls">
      {CONVENTIONAL_BALLS.map((id, i) => {
        // Above the ball, so the tag never runs off the bottom of the lane.
        const at = project(introBallX(i, CONVENTIONAL_BALLS.length), BALL_RADIUS * 2 + 0.05, BALL_START_Z);
        return (
          <li
            key={id}
            className="absolute -translate-x-1/2 -translate-y-full rounded-xl bg-black/45 px-3 py-1.5 text-center leading-tight backdrop-blur-sm sm:px-4 sm:py-2"
            style={{ left: at.x, top: at.y, maxWidth: Math.max(96, gap - 10) }}
          >
            <span className="block text-balance font-display text-sm font-bold text-white sm:text-lg kiosk:text-xl">{DRUGS[id].name}</span>
            <span className="hidden text-balance text-xs text-white/75 sm:block sm:text-sm kiosk:text-base">{DRUGS[id].drugClass}</span>
          </li>
        );
      })}
    </ul>
  );
}

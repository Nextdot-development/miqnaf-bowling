"use client";

import { DRUG_ORDER, DRUGS } from "@/data/gameData";
import { BALL_RADIUS, BALL_START_Z, introBallX } from "@/lib/laneLayout";
import { createProjector } from "@/lib/projection";

/** Name tags under the three balls lined up on the intro lane. */
export function BallLabels({ width, height }: { width: number; height: number }) {
  if (!width || !height) return null;
  const project = createProjector(width, height);

  return (
    <ul className="pointer-events-none absolute inset-0 z-10" aria-label="The three balls">
      {DRUG_ORDER.map((id, i) => {
        const at = project(introBallX(i), 0, BALL_START_Z + BALL_RADIUS + 0.06);
        return (
          // On wide stages the balls sit low; keep the tag inside the lane.
          <li
            key={id}
            className="absolute -translate-x-1/2 whitespace-nowrap rounded-xl bg-black/45 px-3 py-1.5 text-center leading-tight backdrop-blur-sm sm:px-4 sm:py-2"
            style={{ left: at.x, top: `min(${at.y}px, 100% - 5rem)` }}
          >
            <span className="block font-display text-sm font-bold text-white sm:text-xl kiosk:text-2xl">{DRUGS[id].name}</span>
            <span className="hidden text-xs text-white/75 sm:block sm:text-sm kiosk:text-base">{DRUGS[id].drugClass}</span>
          </li>
        );
      })}
    </ul>
  );
}

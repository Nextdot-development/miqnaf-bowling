"use client";

import { createContext, useContext, type MutableRefObject } from "react";
import type { GamePhase } from "@/types/game";

export interface SceneTimeline {
  phase: GamePhase;
  rollStartedAt: number | null;
  /** Swipe progress 0..1 while the player drags the ball (see aimOffset). */
  aim: MutableRefObject<number>;
}

/**
 * Shared mutable timeline read inside useFrame. Kept in a ref so animation
 * frames never trigger React renders.
 */
export const SceneTimelineContext = createContext<MutableRefObject<SceneTimeline> | null>(null);

export function useSceneTimeline() {
  const ref = useContext(SceneTimelineContext);
  if (!ref) throw new Error("useSceneTimeline must be used inside BowlingScene");
  return ref;
}

/** Elapsed roll time: 0 before a roll, live while rolling, ∞ once resolved. */
export function elapsedMs(t: SceneTimeline, now: number): number {
  if (t.phase === "result") return Number.POSITIVE_INFINITY;
  if (t.phase === "rolling" && t.rollStartedAt !== null) return now - t.rollStartedAt;
  return 0;
}

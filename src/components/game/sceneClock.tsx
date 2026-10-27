"use client";

import { createContext, useContext, type MutableRefObject } from "react";
import type { DrugId, GamePhase } from "@/types/game";

export interface SceneTimeline {
  phase: GamePhase;
  rollStartedAt: number | null;
  /** Fixes the ball's curved line (shared by both throws of a session). */
  lineSeed: number | null;
  /** The first throw's ball: fixes the line through the rack (shared by both throws). */
  lineDrug: DrugId | null;
  /** When the transition's rack reset started (performance.now()), if it has. */
  rackResetAt: number | null;
  /** This throw is a second throw (the pinsetter sweeps the deadwood first). */
  sweeping: boolean;
  /** Every pin falls on this throw. */
  strike: boolean;
  aim: MutableRefObject<number>;
}

export const SceneTimelineContext = createContext<MutableRefObject<SceneTimeline> | null>(null);

export function useSceneTimeline() {
  const ref = useContext(SceneTimelineContext);
  if (!ref) throw new Error("useSceneTimeline must be used inside BowlingScene");
  return ref;
}

/** Elapsed roll time: 0 before a roll, live while rolling, ∞ once resolved. */
export function elapsedMs(t: SceneTimeline, now: number): number {
  if (t.phase === "result" || t.phase === "transition" || t.phase === "scorecard" || t.phase === "closing") return Number.POSITIVE_INFINITY;
  if (t.phase === "rolling" && t.rollStartedAt !== null) return now - t.rollStartedAt;
  return 0;
}

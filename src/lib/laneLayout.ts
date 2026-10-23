/**
 * World-space layout shared by the 3D scene and the 2D fallback.
 * Units are roughly metres; the lane is foreshortened (like the design
 * mock-ups) so the ball and all eight pin labels stay large and legible.
 * The ball travels down x = 0 (the lane centre-line) for every roll.
 */
import { PINS } from "@/data/gameData";
import type { PinNumber } from "@/types/game";

export const LANE_HALF_WIDTH = 0.92;
export const GUTTER_WIDTH = 0.22;
export const LANE_NEAR_Z = 1.2;
export const FOUL_LINE_Z = 0.42;
export const ARROWS_Z = -1.25;

export const BALL_RADIUS = 0.11;
export const BALL_START_Z = -0.05;

export const PIN_HEIGHT = 0.5;
export const PIN_MAX_RADIUS = 0.075;
export const PIN_SPACING = 0.4;

/** Pin silhouette: [height fraction, radius as a fraction of max]. */
export const PIN_PROFILE: readonly (readonly [number, number])[] = [
  [0.0, 0.52],
  [0.04, 0.66],
  [0.14, 0.86],
  [0.27, 1.0],
  [0.39, 0.93],
  [0.5, 0.72],
  [0.6, 0.48],
  [0.67, 0.4],
  [0.74, 0.43],
  [0.83, 0.54],
  [0.9, 0.53],
  [0.955, 0.42],
  [0.985, 0.24],
  [1.0, 0.0],
];

export const FRONT_ROW_Z = -3.4;
export const REAR_ROW_Z = -3.8;
export const DECK_END_Z = -4.45;
export const PIT_BACK_Z = -5.1;

export const CAMERA = {
  position: [0, 0.74, 2.05] as const,
  target: [0, -0.16, -5] as const,
  /** Horizontal field of view the framing is designed around. */
  horizontalFov: 55,
  minVerticalFov: 27,
  maxVerticalFov: 62,
};

/** Vertical FOV that keeps the lane framed at any aspect ratio. */
export function verticalFovFor(aspect: number): number {
  // Narrow stages (phones, portrait tablets) zoom in on the deck a little.
  const hfov = Math.min(CAMERA.horizontalFov, Math.max(42, CAMERA.horizontalFov - (1.8 - aspect) * 22));
  const h = (hfov * Math.PI) / 180;
  const v = (2 * Math.atan(Math.tan(h / 2) / Math.max(aspect, 0.1)) * 180) / Math.PI;
  return Math.min(CAMERA.maxVerticalFov, Math.max(CAMERA.minVerticalFov, v));
}

/**
 * Front row 1–4 straddles the centre-line, leaving a ball-width gap between
 * pins 2 and 3. Rear row 5–8 is staggered half a spacing to the right.
 */
export function pinPosition(n: PinNumber): { x: number; z: number } {
  const pin = PINS.find((p) => p.number === n);
  const index = (n - 1) % 4;
  const frontX = (index - 1.5) * PIN_SPACING;
  if (pin?.row === "rear") return { x: frontX + PIN_SPACING / 2, z: REAR_ROW_Z };
  return { x: frontX, z: FRONT_ROW_Z };
}

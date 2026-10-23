/**
 * Pure, drug-agnostic roll timeline. The ball's pose depends only on elapsed
 * time; pins only need to know whether they are scripted to fall. Which pins
 * fall is decided by the outcome matrix (gameLogic), never by this module.
 */
import {
  BALL_RADIUS,
  BALL_START_Z,
  DECK_END_Z,
  FRONT_ROW_Z,
  PIN_MAX_RADIUS,
  PIN_SPACING,
  pinPosition,
} from "@/lib/laneLayout";
import { BALL_TRAVEL_MS } from "@/lib/timing";
import type { PinNumber } from "@/types/game";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInQuad = (t: number) => t * t;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Constant speed so the ball reaches the front row at BALL_TRAVEL_MS. */
export const BALL_SPEED = (BALL_START_Z - FRONT_ROW_Z) / (BALL_TRAVEL_MS / 1000);

export interface BallPose {
  x: number;
  y: number;
  z: number;
  /** Rotation about the x axis (rolling forward). */
  spin: number;
  visible: boolean;
}

export function ballPose(elapsedMs: number): BallPose {
  const t = Math.max(0, elapsedMs) / 1000;
  const z = BALL_START_Z - BALL_SPEED * t;
  let y = BALL_RADIUS;
  if (z < DECK_END_Z) y -= (DECK_END_Z - z) * 1.6; // drops into the pit
  return {
    x: 0,
    y,
    z,
    spin: -(BALL_START_Z - z) / BALL_RADIUS,
    visible: y > -0.6,
  };
}

/** Seconds after roll start when the ball reaches a given z. */
function arrivalSeconds(z: number): number {
  return (BALL_START_Z - z) / BALL_SPEED;
}

export interface PinPose {
  /** Offset from the pin's base position. */
  dx: number;
  dz: number;
  lift: number;
  /** Tip axis (unit vector in the ground plane) and angle in radians. */
  axisX: number;
  axisZ: number;
  angle: number;
  opacity: number;
  /** 0 = normal, 1 = fully dimmed (standing pins after impact). */
  dim: number;
}

/** Seconds for a falling pin to tip from upright to lying on the deck. */
export const FALL_S = 0.45;
const SLIDE_S = 0.75;
const SLIDE_DIST = 0.45;
const FADE_START_S = 0.62;
const FADE_S = 0.3;

/** When this pin starts reacting, in seconds from roll start. */
export function pinReactionStart(n: PinNumber): number {
  const { x, z } = pinPosition(n);
  const lateral = Math.max(0, Math.abs(x) - PIN_SPACING / 2) / 0.6;
  return arrivalSeconds(z) + 0.12 * lateral;
}

/** Direction a falling pin travels: back and away from the centre-line. */
export function fallDirection(n: PinNumber): { x: number; z: number } {
  const { x } = pinPosition(n);
  const side = x === 0 ? (n % 2 === 0 ? 0.15 : -0.15) : Math.sign(x) * (0.35 + Math.abs(x));
  const len = Math.hypot(side, 1);
  return { x: side / len, z: -1 / len };
}

export function pinPose(n: PinNumber, falls: boolean, elapsedMs: number): PinPose {
  const u = elapsedMs / 1000 - pinReactionStart(n);
  const rest: PinPose = { dx: 0, dz: 0, lift: 0, axisX: 1, axisZ: 0, angle: 0, opacity: 1, dim: 0 };
  if (u <= 0) return rest;

  if (!falls) {
    // A brief wobble from the passing ball, then the pin stays upright, dimmed.
    const wobble = u < 3 ? 0.06 * Math.exp(-4.5 * u) * Math.sin(17 * u) : 0;
    return { ...rest, angle: wobble, axisX: 1, axisZ: 0, dim: clamp01(u / 0.45) };
  }

  const dir = fallDirection(n);
  const angle = (Math.PI / 2 - 0.04) * easeInQuad(clamp01(u / FALL_S));
  const slide = SLIDE_DIST * easeOutCubic(clamp01((u - 0.08) / SLIDE_S));
  return {
    dx: dir.x * slide,
    dz: dir.z * slide,
    lift: PIN_MAX_RADIUS * 0.92 * Math.sin(angle),
    // Axis = up × dir, so rotating "up" by +angle tips the pin toward dir.
    axisX: dir.z,
    axisZ: -dir.x,
    angle,
    opacity: 1 - clamp01((u - FADE_START_S) / FADE_S),
    dim: 0,
  };
}

/**
 * Swipe-to-roll "aim": while the player drags the ball it creeps forward
 * (up to AIM_REACH), and once the roll starts that offset fades out over
 * AIM_BLEND_MS. The swipe never changes the path, speed or outcome; every
 * roll converges on the same fixed timeline within a fifth of a second.
 */
export const AIM_REACH = 0.35;
export const AIM_BLEND_MS = 220;

export function aimOffset(phase: "intro" | "selecting" | "rolling" | "result", elapsedMs: number, aim: number): number {
  const a = Math.min(1, Math.max(0, aim));
  if (phase === "selecting") return a * AIM_REACH;
  if (phase === "rolling") return a * AIM_REACH * Math.max(0, 1 - elapsedMs / AIM_BLEND_MS);
  return 0;
}

/** Seconds from roll start until the ball reaches a given z (for sound sync). */
export function ballArrivalSeconds(z: number): number {
  return arrivalSeconds(z);
}

/** Final pose used for the result state and reduced-motion rolls. */
export function finalPinPose(n: PinNumber, falls: boolean): PinPose {
  return pinPose(n, falls, Number.POSITIVE_INFINITY);
}

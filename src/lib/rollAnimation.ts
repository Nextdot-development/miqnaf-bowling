import {
  BALL_RADIUS,
  BALL_START_Z,
  DECK_END_Z,
  FRONT_ROW_Z,
  GUTTER_WIDTH,
  LANE_HALF_WIDTH,
  PIN_HEIGHT,
  PIN_MAX_RADIUS,
  PIN_SPACING,
  pinRow,
  pinPosition,
} from "@/lib/laneLayout";
import { PINS } from "@/data/gameData";
import { rollLane } from "@/lib/gameLogic";
import { BALL_TRAVEL_MS } from "@/lib/timing";
import type { DrugId, GamePhase, LanePin, PinNumber } from "@/types/game";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInQuad = (t: number) => t * t;

/** Average speed from the foul line to the head pin (the ball reaches it at BALL_TRAVEL_MS). */
export const BALL_SPEED = (BALL_START_Z - FRONT_ROW_Z) / (BALL_TRAVEL_MS / 1000);

const SLOWING = 0.25;

/** Fraction of the way to the head pin at fraction `tau` of the travel time. */
function progressAt(tau: number): number {
  if (tau <= 1) return tau * (1 + SLOWING) - SLOWING * tau * tau;
  // Through the pins: each pin it strikes takes some of its momentum, so it
  // ploughs on noticeably slower than it arrived, then drops into the pit.
  return 1 + THROUGH_RACK * (tau - 1);
}

/** The ball's speed through the rack, as a fraction of its average speed down the lane (it meets the head pin at 0.75). */
const THROUGH_RACK = 0.7;

/** Inverse of progressAt up to the head pin: travel fraction at progress `s`. */
function travelFractionAt(s: number): number {
  if (s <= 0) return 0;
  if (s >= 1) return 1 + (s - 1) / THROUGH_RACK; // past the head pin
  const k = SLOWING;
  return ((1 + k) - Math.sqrt((1 + k) * (1 + k) - 4 * k * s)) / (2 * k);
}

export interface BallPose {
  x: number;
  y: number;
  z: number;
  /** Rotation about the x axis (rolling forward). */
  spin: number;
  /** Heading: rotation about the vertical axis, following the curve. */
  heading: number;
  visible: boolean;
}


export interface BallLine {
  bulge: number;
  pocket: number;
}

/** A straight line down the middle (the resting ball, and the default). */
export const STRAIGHT_LINE: BallLine = { bulge: 0, pocket: 0 };

const CLEAR = BALL_RADIUS + PIN_MAX_RADIUS * 0.92;

/** The pocket: half-way between the head pin and pin 3. */
const POCKET_X = PIN_SPACING / 4;

export function rackLineX(drug: DrugId): number {
  const lane = rollLane(drug);
  // A strike: into the pocket, between the head pin and pin 3, as a real strike ball goes.
  if (PINS.every(({ number: n }) => lane[n] === "down")) return POCKET_X;
  let best = { x: 0, hits: -1, offset: Infinity };
  for (let i = -8; i <= 8; i++) {
    const x = (i * PIN_SPACING) / 8;
    let ok = true;
    let hits = 0;
    for (const { number: n } of PINS) {
      const d = Math.abs(pinPosition(n).x - x);
      if (lane[n] !== "down" && d < CLEAR) ok = false;
      if (lane[n] === "down" && d < CLEAR + 0.03) hits++;
    }
    // Prefer more pins met, then a line just off the centre (the pocket).
    const offset = Math.abs(Math.abs(x) - 0.12);
    if (ok && (hits > best.hits || (hits === best.hits && offset < best.offset))) best = { x, hits, offset };
  }
  return best.x;
}


export function ballLineFor(seed: number, drug: DrugId | null = null, aim: number | null = null): BallLine {
  let a = Math.floor(Math.abs(seed * 1000)) | 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const coin = rand() < 0.5 ? -1 : 1;
  const bulge = 0.14 + rand() * 0.16; // 0.14 to 0.30 out to one side
  const pocket = 0.03 + rand() * 0.04;
  if (drug && aim !== null && Number.isFinite(aim)) {
    // Thrown by a swipe: the ball heads out the way the finger went (further
    // the more angled the swipe), then hooks back into its line through the rack.
    const a = Math.max(-1, Math.min(1, aim));
    const side = Math.abs(a) < 0.06 ? coin : Math.sign(a);
    return { bulge: side * (0.03 + Math.abs(a) * 0.3 + rand() * 0.03), pocket: rackLineX(drug) };
  }
  if (drug) {
    const x = rackLineX(drug);
    // Swings out on the side it enters the rack, so it never cuts across the head pin.
    const side = x === 0 ? coin : Math.sign(x);
    return { bulge: side * bulge, pocket: x };
  }
  return { bulge: coin * bulge, pocket: -coin * pocket }; // hooks back across into the pocket
}


function lineX(line: BallLine, u: number): number {
  if (u <= 1) return line.bulge * Math.sin(Math.PI * Math.pow(u, 1.5)) + line.pocket * u * u;
  // Through the pins: straight on along its line, between the pins that stay up.
  return line.pocket;
}

export function ballPose(elapsedMs: number, line: BallLine = STRAIGHT_LINE): BallPose {
  const t = Math.max(0, elapsedMs) / 1000;
  const travel = BALL_START_Z - FRONT_ROW_Z;
  const tau = Number.isFinite(t) ? t / (BALL_TRAVEL_MS / 1000) : 4;
  const u = Math.min(3, progressAt(Math.min(tau, 3.5))); // capped: deep in the pit by then
  const z = BALL_START_Z - travel * u;
  // A small bounce as it is set down on the lane, settling within half a second.
  let y = BALL_RADIUS + (t < 0.6 ? 0.03 * Math.abs(Math.sin(14 * t)) * Math.exp(-8 * t) : 0);
  // A short jolt as it slams into the head pin.
  const hit = t - BALL_TRAVEL_MS / 1000;
  if (hit > 0 && hit < 0.5) y += 0.012 * Math.abs(Math.sin(40 * hit)) * Math.exp(-10 * hit);
  if (z < DECK_END_Z) y -= (DECK_END_Z - z) * 4; // drops into the pit, out of sight
  const x = lineX(line, u);
  const dxdz = (lineX(line, u + 0.001) - x) / (0.001 * travel);
  return {
    x,
    y,
    z,
    spin: -(BALL_START_Z - z) / BALL_RADIUS,
    heading: Math.atan(dxdz),
    visible: Number.isFinite(t) && y > -0.6,
  };
}

/** Seconds after roll start when the ball reaches a given z. */
function arrivalSeconds(z: number): number {
  const s = (BALL_START_Z - z) / (BALL_START_Z - FRONT_ROW_Z);
  return travelFractionAt(s) * (BALL_TRAVEL_MS / 1000);
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
  /** Spin about the vertical axis, applied after the tip (a skidding pin turning). */
  yaw: number;
  opacity: number;
  /** 0 = normal, 1 = fully dimmed (standing pins after impact). */
  dim: number;
}

/** How far below the deck a pin that slides into the pit is out of sight. */
const PIT_HIDDEN = 0.3;

/** Deterministic 0..1 values per pin, so a pin always goes down the same way. */
function pinRand(n: PinNumber, k: number): number {
  const v = Math.sin(n * 127.1 + k * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/** How a knocked pin goes down: its own direction, push, hop and spin. */
function knock(n: PinNumber, pathX: number) {
  const base = fallDirection(n, pathX);
  // Pins in the ball's path are thrown clear of it, harder and faster.
  const inPath = inBallPath(n, pathX);
  const turn = (pinRand(n, 1) - 0.5) * 0.7; // up to about ±20° off its main direction
  const c = Math.cos(turn);
  const sn = Math.sin(turn);
  const dir = { x: base.x * c - base.z * sn, z: base.x * sn + base.z * c };
  return {
    dir,
    // Struck by the ball: kicked out hard and fast. Knocked by another pin: slower.
    tip: inPath ? 0.16 + pinRand(n, 2) * 0.05 : 0.24 + pinRand(n, 2) * 0.12, // seconds to hit the deck
    speed: inPath ? 2.4 + pinRand(n, 3) * 0.3 : 1.1 + pinRand(n, 3) * 0.7, // m/s off the hit
    hop: pinRand(n, 4) < 0.4 ? 0.7 + pinRand(n, 5) * 0.6 : 0, // some pins fly
    // Turns as it skids, always swinging further from the ball's line (at most ~70°).
    spin: -awayFromPath(n, pathX) * (1 + pinRand(n, 6) * 2), // rad/s about the vertical
  };
}
const FRICTION = 2.4; // m/s² deck friction on a sliding pin
const SPIN_DAMP = 2.5;


export function pinReactionStart(n: PinNumber, pathX = 0, strike = false): number {
  const { x, z } = pinPosition(n);
  const impact = arrivalSeconds(FRONT_ROW_Z + Math.sqrt(Math.max(0, CLEAR * CLEAR - pathX * pathX)));
  // A strike: the ball drives into the pocket and the whole rack goes off
  // almost at once, the hit racing back through the pins.
  if (strike) return impact + 0.035 * pinRow(n) + 0.015 * Math.abs(x - pathX);
  // A pin the ball strikes moves the moment the ball touches it.
  const dx = Math.abs(x - pathX);
  if (dx < CLEAR + 0.03) return arrivalSeconds(z + Math.sqrt(Math.max(0, (CLEAR + 0.03) ** 2 - dx * dx)));
  // Others are knocked over by their neighbours as the ball passes their row.
  return Math.max(impact, arrivalSeconds(z + CLEAR)) + 0.03 * Math.abs(x);
}

/** Whether pin `n` stands in or right beside the ball's line through the rack. */
function inBallPath(n: PinNumber, pathX: number): boolean {
  return Math.abs(pinPosition(n).x - pathX) < CLEAR + 0.05;
}

/** Which side of the ball's line (`pathX`) pin `n` is pushed to: +1 right, -1 left. */
function awayFromPath(n: PinNumber, pathX: number): number {
  const { x } = pinPosition(n);
  if (x !== pathX) return Math.sign(x - pathX);
  return Math.sign(x) || (n % 2 === 0 ? -1 : 1);
}

export function fallDirection(n: PinNumber, pathX = 0): { x: number; z: number } {
  const { x } = pinPosition(n);
  const away = awayFromPath(n, pathX);
  if (inBallPath(n, pathX)) {
    const len = Math.hypot(1, 0.45);
    return { x: away / len, z: -0.45 / len };
  }
  const side = away * (0.6 + Math.abs(x - pathX));
  const len = Math.hypot(side, 1);
  return { x: side / len, z: -1 / len };
}

/** Kickback walls: no part of a sliding pin gets further than this from the centre-line. */
const WALL_X = LANE_HALF_WIDTH + GUTTER_WIDTH - PIN_MAX_RADIUS;

/** A half-knocked pin's first lean (radians) and how fast its rocking dies away. */
const ROCK_ANGLE = 0.44;
const ROCK_DECAY = 3.2;
const ROCK_HZ = 2.1;

export function pinPose(n: PinNumber, falls: boolean, elapsedMs: number, wobbles = false, pathX = 0, strike = false): PinPose {
  const u = elapsedMs / 1000 - pinReactionStart(n, pathX, strike);
  const rest: PinPose = { dx: 0, dz: 0, lift: 0, axisX: 1, axisZ: 0, angle: 0, yaw: 0, opacity: 1, dim: 0 };
  if (u <= 0) return rest;

  if (!falls && wobbles) {
    // Tip toward the fall direction, rock back past upright, and settle.
    // The swings shrink to nothing well before the result is shown.
    const dir = fallDirection(n, pathX);
    const angle = Number.isFinite(u) ? ROCK_ANGLE * Math.exp(-ROCK_DECAY * u) * Math.sin(2 * Math.PI * ROCK_HZ * u) : 0;
    return {
      ...rest,
      // Rocks on the edge of its base, so it lifts a little as it leans.
      lift: PIN_MAX_RADIUS * 0.6 * Math.abs(Math.sin(angle)),
      axisX: dir.z,
      axisZ: -dir.x,
      angle,
      dim: clamp01(u / 0.9),
    };
  }

  if (!falls) {
    // Not in the shaking category: it stays perfectly still (upright, dimmed).
    return { ...rest, dim: clamp01(u / 0.45) };
  }

  const k = knock(n, pathX);
  const t = Number.isFinite(u) ? Math.min(u, 3) : 3;
  const tipped = clamp01(t / k.tip);
  const landed = Math.max(0, t - k.tip);
  const bounce = landed > 0 ? 0.14 * Math.exp(-9 * landed) * Math.sin(26 * landed) : 0;
  // Struck, it starts turning at once (not from rest), and gravity speeds it up as it goes over.
  const angle = (Math.PI / 2 - 0.04) * (0.4 * tipped + 0.6 * easeInQuad(tipped)) - Math.abs(bounce);
  const stopAt = k.speed / FRICTION;
  const st = Math.min(t, stopAt);
  const slide = k.speed * st - 0.5 * FRICTION * st * st;
  const air = k.hop > 0 ? Math.max(0, k.hop * t - 4.9 * t * t) : 0;
  const yaw = (k.spin / SPIN_DAMP) * (1 - Math.exp(-SPIN_DAMP * Math.max(0, t - 0.1)));
  const { x, z } = pinPosition(n);
  const zNow = z + k.dir.z * slide;
  const pit = zNow < DECK_END_Z ? (DECK_END_Z - zNow) * 2.2 : 0;
  // The kickbacks stop it: its base stops at the wall, and a pin whose body
  // would reach through the wall turns to lie along it instead.
  const baseX = Math.max(-WALL_X, Math.min(WALL_X, x + k.dir.x * slide));
  const lean = Math.sin(angle) * PIN_HEIGHT;
  const lies = { x: k.dir.x * Math.cos(yaw) + k.dir.z * Math.sin(yaw), z: -k.dir.x * Math.sin(yaw) + k.dir.z * Math.cos(yaw) };
  const room = WALL_X - Math.sign(lies.x) * baseX;
  let turned = yaw;
  if (lean > 1e-6 && Math.abs(lies.x) * lean > room) {
    const nx = Math.sign(lies.x) * Math.max(0, room / lean);
    const nz = -Math.sqrt(1 - nx * nx);
    turned = Math.atan2(k.dir.z * nx - k.dir.x * nz, k.dir.x * nx + k.dir.z * nz);
  }
  return {
    dx: baseX - x,
    dz: k.dir.z * slide,
    lift: PIN_MAX_RADIUS * 0.92 * Math.sin(angle) + air - Math.min(pit, PIT_HIDDEN * 2),
    // Axis = up × dir, so rotating "up" by +angle tips the pin toward dir.
    axisX: k.dir.z,
    axisZ: -k.dir.x,
    angle,
    yaw: turned,
    // Only a pin that has dropped into the pit passes out of sight.
    opacity: 1 - clamp01((pit - PIT_HIDDEN * 0.6) / (PIT_HIDDEN * 0.4)),
    dim: 0,
  };
}

export const AIM_REACH = 0.35;
export const AIM_BLEND_MS = 220;

export function aimOffset(phase: GamePhase, elapsedMs: number, aim: number): number {
  const a = Math.min(1, Math.max(0, aim));
  if (phase === "ready") return a * AIM_REACH;
  if (phase === "rolling") return a * AIM_REACH * Math.max(0, 1 - elapsedMs / AIM_BLEND_MS);
  return 0;
}

/** Seconds from roll start until the ball reaches a given z (for sound sync). */
export function ballArrivalSeconds(z: number): number {
  return arrivalSeconds(z);
}

export const SETTER = { barDown: 0.3, swept: 1.0, barUp: 1.3, liftUp: 0.3, setDown: 1.3, rackStart: 1.05, rackSet: 1.75, tableUp: 2.1 } as const;
export const BAR_PARK_Y = 1.6;
export const BAR_HEIGHT = 0.28;
const BAR_FRONT_Z = FRONT_ROW_Z + 0.4;
const BAR_BACK_Z = DECK_END_Z - 0.2;
/** How high the table lifts the standing pins, and the height a fresh rack is lowered from. */
const TABLE_LIFT = 0.55;
const RACK_DROP = 0.9;
const smooth = (v: number) => v * v * (3 - 2 * v);
const ramp = (s: number, from: number, to: number) => clamp01((s - from) / (to - from));

/** The sweep bar `s` seconds into the cycle: its bottom edge and where it is along the deck (null when parked). */
export function sweepBar(s: number): { y: number; z: number } | null {
  if (!Number.isFinite(s) || s < 0 || s > SETTER.barUp) return null;
  const y = BAR_PARK_Y * (1 - smooth(ramp(s, 0, SETTER.barDown))) + BAR_PARK_Y * smooth(ramp(s, SETTER.swept, SETTER.barUp));
  const z = BAR_FRONT_Z + (BAR_BACK_Z - BAR_FRONT_Z) * smooth(ramp(s, SETTER.barDown, SETTER.swept));
  return { y, z };
}

/** How high the setter table holds the standing pins before a second throw. */
export function tableLift(s: number): number {
  if (!Number.isFinite(s) || s < 0) return 0;
  return TABLE_LIFT * smooth(ramp(s, 0, SETTER.liftUp)) * (1 - smooth(ramp(s, SETTER.swept, SETTER.setDown)));
}

/** Between frames: how far above its spot the fresh rack is (null before it appears). */
export function freshRackLift(s: number): number | null {
  if (!Number.isFinite(s) || s < SETTER.rackStart) return null;
  return RACK_DROP * (1 - smooth(ramp(s, SETTER.rackStart, SETTER.rackSet)));
}

const HIDDEN: PinPose = { dx: 0, dz: 0, lift: 0, axisX: 1, axisZ: 0, angle: 0, yaw: 0, opacity: 0, dim: 0 };
const UPRIGHT: PinPose = { ...HIDDEN, opacity: 1 };

/** A pin pushed back by the sweep bar from `rest`; over the end of the deck it drops into the pit, out of sight. */
function swept(n: PinNumber, rest: PinPose, s: number): PinPose {
  if (rest.opacity === 0) return rest;
  const bar = s >= SETTER.barDown ? sweepBar(s) : null;
  const z0 = pinPosition(n).z;
  const lying = rest.angle > 0.5;
  let z = z0 + rest.dz;
  if (bar) z = Math.min(z, bar.z - (lying ? 0.18 : PIN_MAX_RADIUS + 0.05));
  else if (s >= SETTER.swept) z = BAR_BACK_Z - 0.2;
  const drop = z < DECK_END_Z ? (DECK_END_Z - z) * 3.5 : 0;
  return { ...rest, dz: z - z0, lift: rest.lift - drop, opacity: 1 - clamp01((drop - 0.15) / 0.2) };
}

export interface LanePoseContext {
  /** The ball's line through the rack (rackLineX). */
  pathX: number;
  /** Every pin falls on this throw. */
  strike: boolean;
  /** This throw is a second throw: the pinsetter clears the deadwood first. */
  sweeping: boolean;
  /** Ms since the between-frames reset started (null: not yet). */
  resetSinceMs: number | null;
}

export function lanePinPose(n: PinNumber, status: LanePin, phase: GamePhase, elapsedMs: number, ctx: LanePoseContext): PinPose {
  const { pathX, strike, sweeping, resetSinceMs } = ctx;
  if (phase === "transition") {
    const before = status === "gone" || status === "down" ? finalPinPose(n, true, false, pathX) : UPRIGHT;
    if (resetSinceMs === null || resetSinceMs < 0) return before;
    const s = resetSinceMs / 1000;
    const fresh = freshRackLift(s);
    if (fresh !== null) return { ...UPRIGHT, lift: fresh };
    return swept(n, before, s);
  }
  const s = elapsedMs / 1000;
  // Knocked down by an earlier throw of the frame: cleared away, so the second
  // throw is at the standing pins only (client request).
  if (status === "gone") return sweeping && phase === "rolling" ? swept(n, finalPinPose(n, true, false, pathX), s) : HIDDEN;
  const pose = pinPose(n, status === "down", elapsedMs, status === "wobble", pathX, strike);
  return sweeping && phase === "rolling" ? { ...pose, lift: pose.lift + tableLift(s) } : pose;
}

/** Final pose used for the result state and reduced-motion rolls. */
export function finalPinPose(n: PinNumber, falls: boolean, wobbles = false, pathX = 0, strike = false): PinPose {
  return pinPose(n, falls, Number.POSITIVE_INFINITY, wobbles, pathX, strike);
}

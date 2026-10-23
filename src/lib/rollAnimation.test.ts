import { describe, expect, it } from "vitest";
import { BALL_START_Z, FRONT_ROW_Z } from "@/lib/laneLayout";
import { AIM_BLEND_MS, AIM_REACH, aimOffset, ballPose, finalPinPose, pinPose } from "@/lib/rollAnimation";
import { BALL_TRAVEL_MS } from "@/lib/timing";
import type { PinNumber } from "@/types/game";

describe("roll animation", () => {
  it("ball path depends only on time (same for every drug)", () => {
    // ballPose takes no drug argument; it is a pure function of time.
    expect(ballPose.length).toBe(1);
    expect(ballPose(0)).toMatchObject({ x: 0, z: BALL_START_Z });
  });

  it("reaches the front row at the fixed travel time on the centre-line", () => {
    const p = ballPose(BALL_TRAVEL_MS);
    expect(p.z).toBeCloseTo(FRONT_ROW_Z, 5);
    for (const t of [0, 500, 1000, 1500, 2000]) expect(ballPose(t).x).toBe(0);
  });

  it("standing pins end upright and dimmed, falling pins end hidden", () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8] as PinNumber[]) {
      const up = finalPinPose(n, false);
      expect(up.angle).toBe(0);
      expect(up.opacity).toBe(1);
      expect(up.dim).toBe(1);
      const down = finalPinPose(n, true);
      expect(down.opacity).toBe(0);
      expect(Number.isFinite(down.angle)).toBe(true);
    }
  });

  it("pins are untouched before the ball arrives", () => {
    expect(pinPose(1, true, 1000)).toMatchObject({ angle: 0, opacity: 1 });
  });

  it("swipe offset is bounded and gone shortly after release", () => {
    expect(aimOffset("selecting", 0, 5)).toBe(AIM_REACH);
    expect(aimOffset("rolling", 0, 1)).toBe(AIM_REACH);
    expect(aimOffset("rolling", AIM_BLEND_MS, 1)).toBe(0);
    expect(aimOffset("rolling", 2000, 1)).toBe(0);
    expect(aimOffset("result", 0, 1)).toBe(0);
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pinsDownCount, TOTAL_PINS } from "@/lib/gameLogic";
import { FRONT_ROW_Z } from "@/lib/laneLayout";
import { ballArrivalSeconds } from "@/lib/rollAnimation";
import { buildSoundCues, IMPACT_SECONDS, SOUND_FILES } from "@/lib/rollSound";
import type { DrugId } from "@/types/game";

describe("roll sound plan", () => {
  it("uses the supplied recordings, which exist in public/", () => {
    for (const file of Object.values(SOUND_FILES)) {
      expect(fs.existsSync(path.join(process.cwd(), "public", file))).toBe(true);
    }
  });

  it("lands the strike exactly when the ball reaches the front row", () => {
    expect(IMPACT_SECONDS).toBeCloseTo(ballArrivalSeconds(FRONT_ROW_Z), 9);
    const strike = buildSoundCues(8, 8).find((c) => c.sound === "strike");
    expect(strike?.at).toBeCloseTo(IMPACT_SECONDS, 9);
  });

  it("fades the rolling sound out around impact", () => {
    const roll = buildSoundCues(8, 8).find((c) => c.sound === "roll")!;
    expect(roll.at).toBe(0);
    expect(roll.fadeFrom!).toBeLessThan(IMPACT_SECONDS);
    expect(roll.fadeTo!).toBeGreaterThan(IMPACT_SECONDS);
  });

  it("uses the same timing for every drug; only the crash loudness follows pins down", () => {
    const cues = (drug: DrugId) => buildSoundCues(pinsDownCount(drug), TOTAL_PINS);
    const times = (drug: DrugId) => cues(drug).map((c) => [c.sound, c.at]);
    expect(times("azithromycin")).toEqual(times("nafithromycin"));
    const gain = (drug: DrugId) => cues(drug).find((c) => c.sound === "strike")!.gain;
    expect(gain("nafithromycin")).toBeGreaterThan(gain("azithromycin"));
    expect(gain("nafithromycin")).toBeLessThanOrEqual(1);
  });

  it("plays just the strike straight away for reduced-motion rolls", () => {
    expect(buildSoundCues(5, 8, true)).toEqual([expect.objectContaining({ sound: "strike" })]);
  });
});

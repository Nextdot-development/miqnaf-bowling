import { describe, expect, it } from "vitest";
import {
  CLOSING_COPY,
  CONVENTIONAL_BALLS,
  DISCLAIMER,
  DRUGS,
  FIRST_THROW_SCORE,
  FOOTER_NOTE,
  FRAME_1_SCORE,
  FRAME_2_SCORE,
  NOVEL_BALL,
  PINS,
  WHY_MIQNAF,
} from "@/data/gameData";
import { downPins, pinsDownCount, richToPlain, rollLane, secondThrowLane, standingPins, wobbles } from "@/lib/gameLogic";
import { FRONT_ROW_Z, pinPosition } from "@/lib/laneLayout";
import { EXPECTED_NAMES, validateOutcomeMatrix } from "@/lib/outcomeValidation";
import type { DrugId, PinNumber } from "@/types/game";

const ALL: DrugId[] = ["amoxiclavAzithro", "amoxiclavClarithro", "miqnaf"];

describe("outcome matrix", () => {
  it("passes validation", () => {
    expect(validateOutcomeMatrix()).toEqual([]);
  });

  it("has exactly ten pins numbered 1–10, with the supplied barrier wording", () => {
    expect(PINS.map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const pin of PINS) expect(richToPlain(pin.name)).toBe(EXPECTED_NAMES[pin.number]);
    for (const pin of PINS) expect(pin.label.length).toBeLessThanOrEqual(16); // short enough for the lane tags
  });

  it("racks the ten pins in a full triangle pointing at the bowler", () => {
    const pos = (n: PinNumber) => pinPosition(n);
    expect(pos(1)).toMatchObject({ x: 0, z: FRONT_ROW_Z });
    const rows = [[1], [2, 3], [4, 5, 6], [7, 8, 9, 10]] as PinNumber[][];
    for (let r = 1; r < rows.length; r++) {
      expect(pos(rows[r]![0]!).z).toBeLessThan(pos(rows[r - 1]![0]!).z);
      for (const n of rows[r]!) expect(pos(n).z).toBeCloseTo(pos(rows[r]![0]!).z, 9);
    }
    for (const [l, r] of [[2, 3], [4, 6], [7, 10], [8, 9]] as [PinNumber, PinNumber][]) expect(pos(l).x).toBeCloseTo(-pos(r).x, 9);
  });

  it.each([
    ["amoxiclavAzithro", [2, 6, 7, 9], [1], [3, 4, 5, 8, 10]],
    ["amoxiclavClarithro", [2, 6, 7, 9, 10], [1], [3, 4, 5, 8]],
    ["miqnaf", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [], []],
  ] as const)("%s: down %j, shaking %j, standing %j (as supplied)", (drug, down, shaking, standing) => {
    expect(downPins(drug)).toEqual(down);
    expect(PINS.filter((p) => wobbles(drug, p.number)).map((p) => p.number)).toEqual(shaking);
    expect(standingPins(drug).filter((n) => !wobbles(drug, n))).toEqual(standing);
    expect(pinsDownCount(drug) + standingPins(drug).length).toBe(10);
  });

  it("the second throw knocks nothing more down: cleared pins stay gone, the rest only shake", () => {
    for (const drug of CONVENTIONAL_BALLS) {
      const first = rollLane(drug);
      const second = secondThrowLane(first);
      for (const pin of PINS) {
        expect(second[pin.number]).toBe(first[pin.number] === "down" ? "gone" : "wobble");
      }
    }
  });
});

describe("configuration", () => {
  it("offers exactly the two conventional combinations, and presents MIQNAF® for Frame 2", () => {
    expect(CONVENTIONAL_BALLS.map((d) => DRUGS[d].name)).toEqual(["Amoxi-Clav + Azithromycin", "Amoxi-Clav + Clarithromycin"]);
    expect(NOVEL_BALL).toBe("miqnaf");
    expect(DRUGS.miqnaf).toMatchObject({ name: "MIQNAF®", fullName: "Nafithromycin" });
    expect(ALL).toEqual(Object.keys(DRUGS));
  });

  it("uses the supplied scores as configured values (draft)", () => {
    expect(FIRST_THROW_SCORE.amoxiclavAzithro).toBe(4.5);
    expect(FIRST_THROW_SCORE.amoxiclavClarithro).toBe(5.5);
    expect(FRAME_1_SCORE.amoxiclavAzithro).toBe(5.5); // supplied transition score; differs from 4.5 (pending review)
    expect(FRAME_1_SCORE.amoxiclavClarithro).toBe(5.5);
    expect(FRAME_2_SCORE).toBe(10);
  });

  it("hides 'Why MIQNAF® Changes the Game' until approved content is supplied", () => {
    expect(WHY_MIQNAF).toBeNull();
  });

  it("keeps the supplied closing copy and both footer texts verbatim", () => {
    expect(CLOSING_COPY.lines).toEqual([
      "Thank you for participating in the CABP Challenge!",
      "MIQNAF® is designed to overcome resistance and deliver compliance with a superior profile.",
      "Please use MIQNAF® to secure maximum therapeutic benefit for your CABP patients.",
    ]);
    expect(FOOTER_NOTE).toBe(
      "For scientific discussion among healthcare professionals. Pin outcomes are a teaching model built from published in vitro and clinical data. They do not replace the prescribing information, local antibiograms or clinical judgement.",
    );
    expect(DISCLAIMER).toBe(
      "Disclaimer: This material is intended for scientific and educational purposes only. Views expressed by healthcare professionals are based on their individual clinical experience and are not intended as medical advice or endorsement of any brand or company.",
    );
  });
});

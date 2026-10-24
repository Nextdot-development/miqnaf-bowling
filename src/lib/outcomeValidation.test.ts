import { describe, expect, it } from "vitest";
import { DRUG_ORDER, DRUGS, PINS, DISCLAIMER, FOOTER_NOTE } from "@/data/gameData";
import { downPins, pinsDownCount, standingPins } from "@/lib/gameLogic";
import { EXPECTED_LABELS, validateOutcomeMatrix } from "@/lib/outcomeValidation";

describe("outcome matrix", () => {
  it("passes validation", () => {
    expect(validateOutcomeMatrix()).toEqual([]);
  });

  it("has exactly eight pins with unique numbers 1–8", () => {
    expect(PINS).toHaveLength(8);
    expect(new Set(PINS.map((p) => p.number)).size).toBe(8);
    expect(PINS.map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("uses the supplied labels", () => {
    for (const pin of PINS) expect(pin.label).toBe(EXPECTED_LABELS[pin.number]);
  });

  it("has front row 1–4 and rear row 5–8", () => {
    expect(PINS.filter((p) => p.row === "front").map((p) => p.number)).toEqual([1, 2, 3, 4]);
    expect(PINS.filter((p) => p.row === "rear").map((p) => p.number)).toEqual([5, 6, 7, 8]);
  });

  it.each([
    ["azithromycin", 5, [2, 3, 4]],
    ["clarithromycin", 5, [2, 3, 4]],
    ["nafithromycin", 8, []],
  ] as const)("%s knocks down %i of 8 and leaves %j standing", (drug, down, standing) => {
    expect(pinsDownCount(drug)).toBe(down);
    expect(standingPins(drug)).toEqual(standing);
    expect(downPins(drug).length + standingPins(drug).length).toBe(8);
  });

  it("matches the supplied table cell by cell", () => {
    const table: Record<number, [string, string, string]> = {
      1: ["down", "down", "down"],
      2: ["standing", "standing", "down"],
      3: ["standing", "standing", "down"],
      4: ["standing", "standing", "down"],
      5: ["down", "down", "down"],
      6: ["down", "down", "down"],
      7: ["down", "down", "down"],
      8: ["down", "down", "down"],
    };
    for (const pin of PINS) {
      expect(DRUG_ORDER.map((d) => pin.outcome[d])).toEqual(table[pin.number]);
    }
  });
});

describe("supplied copy", () => {
  it("keeps ball cards verbatim", () => {
    expect(DRUGS.azithromycin).toMatchObject({
      drugClass: "Azalide macrolide",
      description: "Macrolide approved in 1988. Resistance in pneumococci is high in several regions.",
    });
    expect(DRUGS.clarithromycin).toMatchObject({
      drugClass: "Macrolide",
      description: "Macrolide approved in 1991. Shares azithromycin's resistance mechanisms.",
    });
    expect(DRUGS.nafithromycin).toMatchObject({
      drugClass: "Lactone ketolide",
      description: "Designed for macrolide-resistant pneumococci. 3-day, once-daily course.",
    });
  });

  it("keeps both footer texts verbatim", () => {
    expect(FOOTER_NOTE).toBe(
      "For scientific discussion among healthcare professionals. Pin outcomes are a teaching model built from published in vitro and clinical data. They do not replace the prescribing information, local antibiograms or clinical judgement.",
    );
    expect(DISCLAIMER).toBe(
      "Disclaimer: This material is intended for scientific and educational purposes only. Views expressed by healthcare professionals are based on their individual clinical experience and are not intended as medical advice or endorsement of any brand or company.",
    );
  });

  it("gives every standing pin a supplied reason", () => {
    for (const n of standingPins("azithromycin")) {
      expect(PINS.find((p) => p.number === n)?.standingReason).not.toBeNull();
    }
  });
});

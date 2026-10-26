import { describe, expect, it } from "vitest";
import { DRUG_ORDER, DRUGS, PINS, DISCLAIMER, FOOTER_NOTE } from "@/data/gameData";
import { downPins, pinsDownCount, richToPlain, standingPins, wobbles } from "@/lib/gameLogic";
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

  it("uses the agreed short labels", () => {
    for (const pin of PINS) expect(pin.label).toBe(EXPECTED_LABELS[pin.number]);
  });

  it("has front row 1–4 and rear row 5–8", () => {
    expect(PINS.filter((p) => p.row === "front").map((p) => p.number)).toEqual([1, 2, 3, 4]);
    expect(PINS.filter((p) => p.row === "rear").map((p) => p.number)).toEqual([5, 6, 7, 8]);
  });

  it.each([
    ["azithromycin", 4, [1, 5, 6, 8]],
    ["amoxclav", 1, [1, 2, 4, 5, 6, 7, 8]],
    ["nafithromycin", 8, []],
  ] as const)("%s knocks down %i of 8 and leaves %j standing", (drug, down, standing) => {
    expect(pinsDownCount(drug)).toBe(down);
    expect(standingPins(drug)).toEqual(standing);
    expect(downPins(drug).length + standingPins(drug).length).toBe(8);
  });

  it("only amox/clav half-knocks a pin, and only Bactericidal actions", () => {
    const half = PINS.flatMap((p) => DRUG_ORDER.filter((d) => wobbles(d, p.number)).map((d) => `${d}:${p.number}`));
    expect(half).toEqual(["amoxclav:5"]);
  });

  it("matches the supplied list cell by cell (azithromycin, amox/clav, nafithromycin)", () => {
    const table: Record<number, [string, string, string]> = {
      1: ["standing", "standing", "down"], // MDR S. pneumoniae coverage
      2: ["down", "standing", "down"], // Atypical coverage
      3: ["down", "down", "down"], // Safety for paediatric and elderly
      4: ["down", "standing", "down"], // High lung levels
      5: ["standing", "wobble", "down"], // Bactericidal actions: amox/clav "50% down", rocks but stays up
      6: ["standing", "standing", "down"], // PK/PD supporting short course therapy
      7: ["down", "standing", "down"], // Anti-inflammatory activity
      8: ["standing", "standing", "down"], // Monotherapy
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
    expect(DRUGS.amoxclav).toMatchObject({ name: "Amox/clav", drugClass: "β-lactam/β-lactamase inhibitor" });
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

  it("uses the supplied pin wording", () => {
    expect(PINS.map((p) => richToPlain(p.name))).toEqual([
      "MDR S. pneumoniae coverage",
      "Atypical coverage",
      "Safety for paediatric and elderly",
      "High lung levels",
      "Bactericidal actions",
      "PK/PD supporting short course therapy",
      "Anti-inflammatory activity",
      "Monotherapy",
    ]);
  });
});

import { PINS } from "@/data/gameData";
import { pinsDownCount, standingPins } from "@/lib/gameLogic";
import type { DrugId, PinNumber } from "@/types/game";

export const EXPECTED_LABELS: Readonly<Record<PinNumber, string>> = {
  1: "MDR Spn",
  2: "Atypicals",
  3: "Safety",
  4: "Lung levels",
  5: "Bactericidal",
  6: "Short course",
  7: "Anti-inflam.",
  8: "Monotherapy",
};

export const EXPECTED_RESULTS: Readonly<Record<DrugId, { down: number; standing: PinNumber[] }>> = {
  azithromycin: { down: 4, standing: [1, 5, 6, 8] },
  amoxclav: { down: 1, standing: [1, 2, 4, 5, 6, 7, 8] },
  nafithromycin: { down: 8, standing: [] },
};

export function validateOutcomeMatrix(): string[] {
  const errors: string[] = [];
  if (PINS.length !== 8) errors.push(`Expected 8 pins, found ${PINS.length}`);

  const numbers = PINS.map((p) => p.number);
  if (new Set(numbers).size !== numbers.length) errors.push("Pin numbers are not unique");

  for (const pin of PINS) {
    if (EXPECTED_LABELS[pin.number] !== pin.label) {
      errors.push(`Pin ${pin.number} label "${pin.label}" should be "${EXPECTED_LABELS[pin.number]}"`);
    }
    const expectedRow = pin.number <= 4 ? "front" : "rear";
    if (pin.row !== expectedRow) errors.push(`Pin ${pin.number} should be in the ${expectedRow} row`);
  }

  for (const [drug, expected] of Object.entries(EXPECTED_RESULTS) as [DrugId, (typeof EXPECTED_RESULTS)[DrugId]][]) {
    const down = pinsDownCount(drug);
    if (down !== expected.down) errors.push(`${drug}: expected ${expected.down} down, found ${down}`);
    const standing = standingPins(drug);
    if (standing.join(",") !== expected.standing.join(",")) {
      errors.push(`${drug}: expected standing [${expected.standing}], found [${standing}]`);
    }
  }
  return errors;
}

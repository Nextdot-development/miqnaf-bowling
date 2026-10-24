import { PINS } from "@/data/gameData";
import { pinsDownCount, standingPins } from "@/lib/gameLogic";
import type { DrugId, PinNumber } from "@/types/game";

export const EXPECTED_LABELS: Readonly<Record<PinNumber, string>> = {
  1: "Spn",
  2: "Spn-mef",
  3: "Spn-erm",
  4: "Spy-erm",
  5: "Mc",
  6: "Mp",
  7: "Cp",
  8: "Lp",
};

export const EXPECTED_RESULTS: Readonly<Record<DrugId, { down: number; standing: PinNumber[] }>> = {
  azithromycin: { down: 5, standing: [2, 3, 4] },
  clarithromycin: { down: 5, standing: [2, 3, 4] },
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

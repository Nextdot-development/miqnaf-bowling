/**
 * Everything outcome-related is derived from PINS[].outcome here. Components,
 * the 3D scene and the coverage board call these helpers rather than reading
 * or re-encoding the matrix themselves.
 */
import { DRUGS, PINS } from "@/data/gameData";
import type { DrugId, Pin, PinNumber, PinStatus, RichText } from "@/types/game";

export const TOTAL_PINS = PINS.length;

export function getPin(n: PinNumber): Pin {
  const pin = PINS.find((p) => p.number === n);
  if (!pin) throw new Error(`Unknown pin ${n}`);
  return pin;
}

export function pinStatus(drug: DrugId, n: PinNumber): PinStatus {
  return getPin(n).outcome[drug];
}

export function downPins(drug: DrugId): PinNumber[] {
  return PINS.filter((p) => p.outcome[drug] === "down").map((p) => p.number);
}

export function standingPins(drug: DrugId): PinNumber[] {
  return PINS.filter((p) => p.outcome[drug] === "standing").map((p) => p.number);
}

export function pinsDownCount(drug: DrugId): number {
  return downPins(drug).length;
}

/** Outcome visible to the player: hidden until that drug has been rolled. */
export function revealedStatus(
  drug: DrugId,
  n: PinNumber,
  rolledDrugs: readonly DrugId[],
): PinStatus | "not-rolled" {
  return rolledDrugs.includes(drug) ? pinStatus(drug, n) : "not-rolled";
}

export function drugName(drug: DrugId): string {
  return DRUGS[drug].name;
}

export function richToPlain(text: RichText): string {
  return text.map((s) => (typeof s === "string" ? s : s.em)).join("");
}

/** Human list: [2,3,4] -> "2, 3 and 4". */
export function joinPinNumbers(nums: readonly number[]): string {
  if (nums.length <= 1) return nums.join("");
  return `${nums.slice(0, -1).join(", ")} and ${nums[nums.length - 1]}`;
}

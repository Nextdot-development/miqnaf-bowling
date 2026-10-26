import { DRUGS, PINS } from "@/data/gameData";
import type { DrugId, LanePin, LanePins, Pin, PinNumber, PinStatus, RichText } from "@/types/game";

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

/** Pins still up after the roll, including any that only wobbled. */
export function standingPins(drug: DrugId): PinNumber[] {
  return PINS.filter((p) => p.outcome[drug] !== "down").map((p) => p.number);
}

export function wobbles(drug: DrugId, n: PinNumber): boolean {
  return pinStatus(drug, n) === "wobble";
}

export function pinsDownCount(drug: DrugId): number {
  return downPins(drug).length;
}

export function richToPlain(text: RichText): string {
  return text.map((s) => (typeof s === "string" ? s : s.em)).join("");
}

/** Human list: [2,3,4] -> "2, 3 and 4". */
export function joinPinNumbers(nums: readonly number[]): string {
  if (nums.length <= 1) return nums.join("");
  return `${nums.slice(0, -1).join(", ")} and ${nums[nums.length - 1]}`;
}

/** Whether a pin's short tag adds anything next to its full wording ("Monotherapy" does not). */
export function hasDistinctLabel(pin: Pin): boolean {
  return pin.label !== richToPlain(pin.name);
}

/** The lane before a throw: pins cleared after round 1 are gone, the rest are up. */
export function laneBefore(cleared: readonly PinNumber[]): LanePins {
  return Object.fromEntries(PINS.map((p) => [p.number, cleared.includes(p.number) ? "cleared" : "up"])) as Record<PinNumber, LanePin>;
}

/**
 * Every pin's state after throwing `drug`. Pins cleared after round 1 stay
 * cleared. A half-knocked pin only ever wobbles, in either round (amox/clav
 * on Bactericidal actions), so it is still up afterwards.
 */
export function rollLane(drug: DrugId, cleared: readonly PinNumber[]): LanePins {
  return Object.fromEntries(
    PINS.map((p) => {
      if (cleared.includes(p.number)) return [p.number, "cleared"];
      const status = p.outcome[drug];
      if (status === "down") return [p.number, "down"];
      return [p.number, status === "wobble" ? "wobble" : "up"];
    }),
  ) as Record<PinNumber, LanePin>;
}

export function laneDown(lane: LanePins): PinNumber[] {
  return PINS.filter((p) => lane[p.number] === "down" || lane[p.number] === "cleared").map((p) => p.number);
}

export function laneStanding(lane: LanePins): PinNumber[] {
  return PINS.filter((p) => lane[p.number] === "up" || lane[p.number] === "wobble").map((p) => p.number);
}

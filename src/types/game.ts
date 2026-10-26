export type DrugId = "azithromycin" | "amoxclav" | "nafithromycin";
export type PinNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type PinStatus = "down" | "standing" | "wobble";

export type RichSegment = string | { em: string };
export type RichText = readonly RichSegment[];

export interface Drug {
  id: DrugId;
  name: string;
  drugClass: string;
  description: string;
}

export interface Pin {
  number: PinNumber;
  label: string;
  row: "front" | "rear";
  /** Full pin wording (shown in the pin list, cards and pop-ups). */
  name: RichText;
  /** Down / standing per drug. The only outcome matrix in the codebase. */
  outcome: Readonly<Record<DrugId, PinStatus>>;
}

export type LanePin = "up" | "down" | "wobble" | "cleared";
export type LanePins = Readonly<Record<PinNumber, LanePin>>;

/** Each player gets up to two throws: round 1, then round 2 with the pins left. */
export type Round = 1 | 2;

export interface RollResult {
  rollId: number;
  drug: DrugId;
  round: Round;
  /** Every pin's state after this throw. */
  lane: LanePins;
  /** Pins down in total, including any cleared after round 1. */
  pinsDown: number;
  totalPins: number;
  /** Pins still up (including any that only wobbled). */
  standing: PinNumber[];
}

/** Top-level game phase. The pin card is an overlay on top. */
export type GamePhase = "intro" | "selecting" | "rolling" | "result";

export interface GameState {
  phase: GamePhase;
  sessionStarted: boolean;
  selectedDrug: DrugId | null;
  /** Drugs rolled at least once this session, in roll order. */
  rolledDrugs: DrugId[];
  /** Increments with every roll; guards stale completion events. */
  rollId: number;
  /** performance.now()-style timestamp the current roll started at. */
  rollStartedAt: number | null;
  /** True when the current roll skips animation (reduced motion). */
  rollInstant: boolean;
  result: RollResult | null;
  round: Round;
  /** Pins knocked down in round 1, cleared from the lane for round 2. */
  cleared: PinNumber[];
  soundOn: boolean;
  openPin: PinNumber | null;
}

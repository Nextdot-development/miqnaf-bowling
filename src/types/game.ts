/** Shared types for the CABP Bowling Game. */

export type DrugId = "azithromycin" | "clarithromycin" | "nafithromycin";

export type PinNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PinStatus = "down" | "standing";

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
  organism: RichText;
  /** Supplied resistance mechanism, only where the brief provides one. */
  mechanism: RichText | null;
  /** Supplied reason shown when the pin is left standing. */
  standingReason: RichText | null;
  /** Supplied basis line, shown verbatim. */
  basis: string;
  /**
   * "Why it matters in CABP" copy. Null until approved copy is supplied;
   * the UI then shows a "pending scientific review" placeholder.
   */
  whyItMatters: string | null;
  /** Down / standing per drug. The only outcome matrix in the codebase. */
  outcome: Readonly<Record<DrugId, PinStatus>>;
}

export type PromptId = "A" | "B" | "C" | "D";

export interface DiscussionPrompt {
  id: PromptId;
  trigger: string;
  text: string;
}

export interface RollResult {
  rollId: number;
  drug: DrugId;
  pinsDown: number;
  totalPins: number;
  standing: PinNumber[];
  promptId: PromptId | null;
}

/** Top-level game phase. The pathogen card is an overlay on top. */
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
  usedPrompts: PromptId[];
  soundOn: boolean;
  openPin: PinNumber | null;
}

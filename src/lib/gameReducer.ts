/**
 * Predictable state machine for the game. Pure: no timers, audio or DOM.
 *
 *   intro ─START─▶ selecting ─ROLL─▶ rolling ─ROLL_COMPLETE─▶ result
 *                      ▲                                         │
 *                      └──────────────SELECT_DRUG────────────────┘
 *
 * Coverage board and pathogen detail are overlays that never change the
 * phase. NEW_SESSION is the only action that clears session history.
 */
import { DRUG_ORDER } from "@/data/gameData";
import { pinsDownCount, standingPins, TOTAL_PINS } from "@/lib/gameLogic";
import { selectCoveragePrompt, selectRollPrompt } from "@/lib/promptLogic";
import type { CoverageMode, DrugId, GameState, PinNumber } from "@/types/game";

export type GameAction =
  | { type: "START_SESSION" }
  | { type: "NEW_SESSION" }
  | { type: "SELECT_DRUG"; drug: DrugId }
  | { type: "CHOOSE_ANOTHER" }
  | { type: "ROLL"; at: number; instant: boolean }
  | { type: "ROLL_COMPLETE"; rollId: number }
  | { type: "OPEN_COVERAGE" }
  | { type: "CLOSE_COVERAGE" }
  | { type: "SET_COVERAGE_MODE"; mode: CoverageMode }
  | { type: "OPEN_PIN"; pin: PinNumber }
  | { type: "CLOSE_PIN" }
  | { type: "SET_SOUND"; on: boolean };

export const initialGameState: GameState = {
  phase: "intro",
  sessionStarted: false,
  selectedDrug: null,
  rolledDrugs: [],
  rollId: 0,
  rollStartedAt: null,
  rollInstant: false,
  result: null,
  usedPrompts: [],
  // On by default (client request); audio starts on the first tap.
  soundOn: true,
  coverageOpen: false,
  coverageVisited: false,
  coverageMode: "session",
  coveragePromptId: null,
  openPin: null,
};

function completeRoll(state: GameState): GameState {
  const drug = state.selectedDrug;
  if (!drug) return state;
  const rolledDrugs = state.rolledDrugs.includes(drug) ? state.rolledDrugs : [...state.rolledDrugs, drug];
  const promptId = selectRollPrompt(drug, rolledDrugs, state.usedPrompts);
  return {
    ...state,
    phase: "result",
    rolledDrugs,
    usedPrompts: promptId ? [...state.usedPrompts, promptId] : state.usedPrompts,
    result: {
      rollId: state.rollId,
      drug,
      pinsDown: pinsDownCount(drug),
      totalPins: TOTAL_PINS,
      standing: standingPins(drug),
      promptId,
    },
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_SESSION":
      if (state.phase !== "intro") return state;
      return { ...state, phase: "selecting", sessionStarted: true };

    case "NEW_SESSION":
      // Fresh start for the next participant, with sound back on.
      return { ...initialGameState, phase: "intro" };

    case "SELECT_DRUG":
      if (state.phase === "intro" || state.phase === "rolling") return state;
      if (!DRUG_ORDER.includes(action.drug)) return state;
      // Selecting after a result resets the lane but keeps session history.
      return {
        ...state,
        phase: "selecting",
        selectedDrug: action.drug,
        result: null,
        rollStartedAt: null,
        rollInstant: false,
      };

    case "CHOOSE_ANOTHER":
      // "Choose another ball": reset the lane, keep session history.
      if (state.phase !== "result") return state;
      return { ...state, phase: "selecting", selectedDrug: null, result: null, rollStartedAt: null, rollInstant: false };

    case "ROLL": {
      if (state.phase !== "selecting" || !state.selectedDrug) return state;
      const rolling: GameState = {
        ...state,
        phase: "rolling",
        rollId: state.rollId + 1,
        rollStartedAt: action.at,
        rollInstant: action.instant,
        coverageOpen: false,
        openPin: null,
      };
      return action.instant ? completeRoll(rolling) : rolling;
    }

    case "ROLL_COMPLETE":
      if (state.phase !== "rolling" || action.rollId !== state.rollId) return state;
      return completeRoll(state);

    case "OPEN_COVERAGE": {
      if (state.coverageOpen || state.phase === "intro" || state.phase === "rolling") return state;
      const promptId = selectCoveragePrompt(state.usedPrompts);
      return {
        ...state,
        coverageOpen: true,
        coverageVisited: true,
        coverageMode: "session",
        coveragePromptId: promptId,
        usedPrompts: promptId ? [...state.usedPrompts, promptId] : state.usedPrompts,
        openPin: null,
      };
    }

    case "CLOSE_COVERAGE":
      return { ...state, coverageOpen: false, coveragePromptId: null };

    case "SET_COVERAGE_MODE":
      return state.coverageOpen ? { ...state, coverageMode: action.mode } : state;

    case "OPEN_PIN":
      if (state.phase === "intro" || state.phase === "rolling") return state;
      return { ...state, openPin: action.pin };

    case "CLOSE_PIN":
      return { ...state, openPin: null };

    case "SET_SOUND":
      return { ...state, soundOn: action.on };

    default:
      return state;
  }
}

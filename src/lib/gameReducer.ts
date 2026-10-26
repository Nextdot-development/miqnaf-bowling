import { DRUG_ORDER } from "@/data/gameData";
import { laneDown, laneStanding, rollLane, TOTAL_PINS } from "@/lib/gameLogic";
import { selectRollPrompt } from "@/lib/promptLogic";
import type { DrugId, GameState, PinNumber } from "@/types/game";

export type GameAction =
  | { type: "START_SESSION" }
  | { type: "NEW_SESSION" }
  | { type: "SELECT_DRUG"; drug: DrugId }
  | { type: "CHOOSE_ANOTHER" }
  | { type: "NEXT_ROUND" }
  | { type: "ROLL"; at: number; instant: boolean }
  | { type: "ROLL_COMPLETE"; rollId: number }
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
  round: 1,
  cleared: [],
  usedPrompts: [],
  // On by default (client request); audio starts on the first tap.
  soundOn: true,
  openPin: null,
};

function completeRoll(state: GameState): GameState {
  const drug = state.selectedDrug;
  if (!drug) return state;
  const rolledDrugs = state.rolledDrugs.includes(drug) ? state.rolledDrugs : [...state.rolledDrugs, drug];
  const promptId = selectRollPrompt(drug, rolledDrugs, state.usedPrompts);
  const lane = rollLane(drug, state.cleared);
  return {
    ...state,
    phase: "result",
    rolledDrugs,
    usedPrompts: promptId ? [...state.usedPrompts, promptId] : state.usedPrompts,
    result: {
      rollId: state.rollId,
      drug,
      round: state.round,
      lane,
      pinsDown: laneDown(lane).length,
      totalPins: TOTAL_PINS,
      standing: laneStanding(lane),
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
      // Fresh start for the next participant, with sound back on. The roll
      // counter keeps counting: each roll's sound is keyed on its id, so
      // restarting it at 0 would make the next player's first roll silent.
      return { ...initialGameState, phase: "intro", rollId: state.rollId };

    case "SELECT_DRUG":
      if (state.phase === "intro" || state.phase === "rolling") return state;
      if (!DRUG_ORDER.includes(action.drug)) return state;
      // Round 2 is played with one of the two balls not used in round 1.
      if (state.round === 2 && state.rolledDrugs.includes(action.drug)) return state;
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

    case "NEXT_ROUND":
      // After a round 1 throw that leaves pins up: clear the fallen pins and
      // let the player pick one of the other two balls.
      if (state.phase !== "result" || state.round !== 1 || !state.result || state.result.standing.length === 0) return state;
      return {
        ...state,
        phase: "selecting",
        round: 2,
        cleared: laneDown(state.result.lane),
        selectedDrug: null,
        result: null,
        rollStartedAt: null,
        rollInstant: false,
      };

    case "ROLL": {
      if (state.phase !== "selecting" || !state.selectedDrug) return state;
      const rolling: GameState = {
        ...state,
        phase: "rolling",
        rollId: state.rollId + 1,
        rollStartedAt: action.at,
        rollInstant: action.instant,
        openPin: null,
      };
      return action.instant ? completeRoll(rolling) : rolling;
    }

    case "ROLL_COMPLETE":
      if (state.phase !== "rolling" || action.rollId !== state.rollId) return state;
      return completeRoll(state);

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

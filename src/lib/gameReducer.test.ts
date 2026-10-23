import { describe, expect, it } from "vitest";
import { gameReducer, initialGameState, type GameAction } from "@/lib/gameReducer";
import type { DrugId, GameState } from "@/types/game";

const run = (actions: GameAction[], from: GameState = initialGameState) => actions.reduce(gameReducer, from);
const started = run([{ type: "START_SESSION" }]);

function rollDrug(state: GameState, drug: DrugId): GameState {
  const s1 = gameReducer(state, { type: "SELECT_DRUG", drug });
  const s2 = gameReducer(s1, { type: "ROLL", at: 0, instant: false });
  return gameReducer(s2, { type: "ROLL_COMPLETE", rollId: s2.rollId });
}

describe("game reducer", () => {
  it("starts on the intro with sound on", () => {
    expect(initialGameState.phase).toBe("intro");
    expect(initialGameState.soundOn).toBe(true);
  });

  it("cannot roll until a ball is selected", () => {
    expect(gameReducer(started, { type: "ROLL", at: 0, instant: false })).toBe(started);
  });

  it("does not auto-roll on selection", () => {
    const s = gameReducer(started, { type: "SELECT_DRUG", drug: "azithromycin" });
    expect(s.phase).toBe("selecting");
    expect(s.result).toBeNull();
  });

  it("ignores a second roll and ball changes while rolling", () => {
    const rolling = run([{ type: "SELECT_DRUG", drug: "azithromycin" }, { type: "ROLL", at: 0, instant: false }], started);
    expect(rolling.phase).toBe("rolling");
    expect(gameReducer(rolling, { type: "ROLL", at: 5, instant: false })).toBe(rolling);
    expect(gameReducer(rolling, { type: "SELECT_DRUG", drug: "nafithromycin" })).toBe(rolling);
  });

  it("ignores stale completion events", () => {
    const rolling = run([{ type: "SELECT_DRUG", drug: "azithromycin" }, { type: "ROLL", at: 0, instant: false }], started);
    expect(gameReducer(rolling, { type: "ROLL_COMPLETE", rollId: rolling.rollId - 1 })).toBe(rolling);
  });

  it("produces results from the outcome matrix", () => {
    const azi = rollDrug(started, "azithromycin");
    expect(azi.result).toMatchObject({ drug: "azithromycin", pinsDown: 5, totalPins: 8, standing: [2, 3, 4], promptId: "B" });
    const naf = rollDrug(azi, "nafithromycin");
    expect(naf.result).toMatchObject({ pinsDown: 8, standing: [], promptId: "A" });
  });

  it("selecting another ball resets the lane and result but keeps history", () => {
    const azi = rollDrug(started, "azithromycin");
    const next = gameReducer(azi, { type: "SELECT_DRUG", drug: "clarithromycin" });
    expect(next.phase).toBe("selecting");
    expect(next.result).toBeNull();
    expect(next.rollStartedAt).toBeNull();
    expect(next.rolledDrugs).toEqual(["azithromycin"]);
    expect(next.usedPrompts).toEqual(["B"]);
  });

  it("never repeats a prompt within a session", () => {
    let s = rollDrug(started, "azithromycin"); // B
    s = rollDrug(s, "clarithromycin"); // B used, not all rolled -> none
    expect(s.result?.promptId).toBeNull();
    s = gameReducer(s, { type: "OPEN_COVERAGE" }); // C
    expect(s.coveragePromptId).toBe("C");
    s = gameReducer(s, { type: "CLOSE_COVERAGE" });
    s = gameReducer(s, { type: "OPEN_COVERAGE" });
    expect(s.coveragePromptId).toBeNull();
    s = gameReducer(s, { type: "CLOSE_COVERAGE" });
    s = rollDrug(s, "nafithromycin"); // A is still unused
    expect(s.result?.promptId).toBe("A");
    s = rollDrug(s, "azithromycin"); // D
    expect(s.result?.promptId).toBe("D");
    s = rollDrug(s, "nafithromycin"); // nothing left
    expect(s.result?.promptId).toBeNull();
    expect(new Set(s.usedPrompts).size).toBe(s.usedPrompts.length);
  });

  it("matches the mock-up order: azithromycin, nafithromycin, clarithromycin -> D", () => {
    let s = rollDrug(started, "azithromycin");
    s = rollDrug(s, "nafithromycin");
    s = rollDrug(s, "clarithromycin");
    expect(s.result?.promptId).toBe("D");
  });

  it("reduced-motion rolls resolve immediately with the same outcome", () => {
    const s = run([{ type: "SELECT_DRUG", drug: "clarithromycin" }, { type: "ROLL", at: 0, instant: true }], started);
    expect(s.phase).toBe("result");
    expect(s.result).toMatchObject({ pinsDown: 5, standing: [2, 3, 4] });
  });

  it("only NEW_SESSION clears session history, and it turns sound back on", () => {
    let s = gameReducer(started, { type: "SET_SOUND", on: false });
    s = rollDrug(s, "nafithromycin");
    s = gameReducer(s, { type: "CHOOSE_ANOTHER" });
    expect(s.rolledDrugs).toEqual(["nafithromycin"]);
    s = gameReducer(s, { type: "NEW_SESSION" });
    expect(s).toMatchObject({ phase: "intro", rolledDrugs: [], usedPrompts: [], soundOn: true, coverageVisited: false });
  });

  it("does not open pin cards mid-roll", () => {
    const rolling = run([{ type: "SELECT_DRUG", drug: "azithromycin" }, { type: "ROLL", at: 0, instant: false }], started);
    expect(gameReducer(rolling, { type: "OPEN_PIN", pin: 2 }).openPin).toBeNull();
  });
});

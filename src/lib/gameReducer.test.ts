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
    expect(azi.result).toMatchObject({ drug: "azithromycin", pinsDown: 4, totalPins: 8, standing: [1, 5, 6, 8], promptId: "B" });
    const naf = rollDrug(azi, "nafithromycin");
    expect(naf.result).toMatchObject({ pinsDown: 8, standing: [], promptId: "A" });
  });

  it("selecting another ball resets the lane and result but keeps history", () => {
    const azi = rollDrug(started, "azithromycin");
    const next = gameReducer(azi, { type: "SELECT_DRUG", drug: "amoxclav" });
    expect(next.phase).toBe("selecting");
    expect(next.result).toBeNull();
    expect(next.rollStartedAt).toBeNull();
    expect(next.rolledDrugs).toEqual(["azithromycin"]);
    expect(next.usedPrompts).toEqual(["B"]);
  });

  it("never repeats a prompt within a session", () => {
    let s = rollDrug(started, "azithromycin"); // B
    s = rollDrug(s, "amoxclav"); // B used, not all rolled -> none
    expect(s.result?.promptId).toBeNull();
    s = rollDrug(s, "nafithromycin"); // A is still unused
    expect(s.result?.promptId).toBe("A");
    s = rollDrug(s, "azithromycin"); // D
    expect(s.result?.promptId).toBe("D");
    s = rollDrug(s, "nafithromycin"); // nothing left
    expect(s.result?.promptId).toBeNull();
    expect(new Set(s.usedPrompts).size).toBe(s.usedPrompts.length);
  });

  it("matches the mock-up order: azithromycin, nafithromycin, amoxclav -> D", () => {
    let s = rollDrug(started, "azithromycin");
    s = rollDrug(s, "nafithromycin");
    s = rollDrug(s, "amoxclav");
    expect(s.result?.promptId).toBe("D");
  });

  it("reduced-motion rolls resolve immediately with the same outcome", () => {
    const s = run([{ type: "SELECT_DRUG", drug: "amoxclav" }, { type: "ROLL", at: 0, instant: true }], started);
    expect(s.phase).toBe("result");
    expect(s.result).toMatchObject({ pinsDown: 1, standing: [1, 2, 4, 5, 6, 7, 8] });
  });

  it("only NEW_SESSION clears session history, and it turns sound back on", () => {
    let s = gameReducer(started, { type: "SET_SOUND", on: false });
    s = rollDrug(s, "nafithromycin");
    s = gameReducer(s, { type: "CHOOSE_ANOTHER" });
    expect(s.rolledDrugs).toEqual(["nafithromycin"]);
    s = gameReducer(s, { type: "NEW_SESSION" });
    expect(s).toMatchObject({ phase: "intro", rolledDrugs: [], usedPrompts: [], soundOn: true });
  });

  it("keeps roll ids unique across sessions (each roll's sound is keyed on its id)", () => {
    let s = rollDrug(started, "azithromycin");
    const first = s.rollId;
    s = gameReducer(s, { type: "NEW_SESSION" });
    s = gameReducer(s, { type: "START_SESSION" });
    s = rollDrug(s, "amoxclav");
    expect(s.rollId).toBeGreaterThan(first);
  });

  it("does not open pin cards mid-roll", () => {
    const rolling = run([{ type: "SELECT_DRUG", drug: "azithromycin" }, { type: "ROLL", at: 0, instant: false }], started);
    expect(gameReducer(rolling, { type: "OPEN_PIN", pin: 2 }).openPin).toBeNull();
  });
});

describe('two rounds', () => {
  const round2 = (first: DrugId, second: DrugId) => {
    let s = rollDrug(started, first);
    s = gameReducer(s, { type: 'NEXT_ROUND' });
    return rollDrug(s, second);
  };

  it.each([
    // [round 1 ball, round 2 ball, pins down in total, pins still up]
    ['azithromycin', 'amoxclav', 4, [1, 5, 6, 8]], // amox/clav only wobbles Bactericidal actions
    ['azithromycin', 'nafithromycin', 8, []],
    ['amoxclav', 'azithromycin', 4, [1, 5, 6, 8]],
    ['amoxclav', 'nafithromycin', 8, []],
  ] as const)('%s then %s: %i of 8 down', (first, second, down, standing) => {
    const s = round2(first, second);
    expect(s.result).toMatchObject({ round: 2, pinsDown: down, standing });
  });

  it('clears the round 1 pins for round 2 and keeps them cleared', () => {
    let s = rollDrug(started, 'azithromycin');
    s = gameReducer(s, { type: 'NEXT_ROUND' });
    expect(s).toMatchObject({ phase: 'selecting', round: 2, cleared: [2, 3, 4, 7], selectedDrug: null });
    s = rollDrug(s, 'amoxclav');
    expect([2, 3, 4, 7].map((n) => s.result!.lane[n as 2])).toEqual(['cleared', 'cleared', 'cleared', 'cleared']);
  });

  it('does not offer the round 1 ball again', () => {
    let s = rollDrug(started, 'amoxclav');
    s = gameReducer(s, { type: 'NEXT_ROUND' });
    expect(gameReducer(s, { type: 'SELECT_DRUG', drug: 'amoxclav' }).selectedDrug).toBeNull();
    expect(gameReducer(s, { type: 'SELECT_DRUG', drug: 'nafithromycin' }).selectedDrug).toBe('nafithromycin');
  });

  it('has no round 2 after a strike, and none after round 2', () => {
    expect(gameReducer(rollDrug(started, 'nafithromycin'), { type: 'NEXT_ROUND' }).round).toBe(1);
    expect(gameReducer(round2('azithromycin', 'amoxclav'), { type: 'NEXT_ROUND' }).phase).toBe('result');
  });

  it('a new game starts again at round 1 with every pin up', () => {
    const s = gameReducer(round2('azithromycin', 'amoxclav'), { type: 'NEW_SESSION' });
    expect(s).toMatchObject({ round: 1, cleared: [], rolledDrugs: [] });
  });
});

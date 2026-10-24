import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ROLL_TOTAL_MS } from "@/lib/timing";
import { useGameState } from "./useGameState";

const playRoll = vi.fn(async () => {});
vi.mock("@/hooks/useGameAudio", () => ({
  useGameAudio: () => ({ playRoll, unlock: () => {}, stopAll: () => {} }),
}));

beforeEach(() => {
  playRoll.mockClear();
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("useGameState sound", () => {
  it("plays the roll sound for every player, not just the first", () => {
    const { result } = renderHook(() => useGameState(false));

    const playOneGame = (drug: "azithromycin" | "nafithromycin") => {
      act(() => result.current.start());
      act(() => result.current.selectDrug(drug));
      act(() => result.current.roll());
      act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
      act(() => result.current.newSession()); // one ball per player, then restart
    };

    playOneGame("azithromycin");
    playOneGame("nafithromycin");
    playOneGame("azithromycin");
    expect(playRoll).toHaveBeenCalledTimes(3);
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { END_POPUP_DELAY_MS, ROLL_TOTAL_MS } from "@/lib/timing";
import { mediaState } from "@/test/setup";
import { GameShell } from "./GameShell";

const playEnding = vi.fn();
const playQuestion = vi.fn();
vi.mock("@/hooks/useGameAudio", () => ({
  useGameAudio: () => ({ playRoll: async () => {}, playEnding, playQuestion, unlock: () => {}, stopAll: () => {} }),
}));

beforeEach(() => {
  playEnding.mockClear();
  playQuestion.mockClear();
  mediaState.reducedMotion = false;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  vi.useRealTimers();
});

const button = (name: RegExp) => screen.getByRole("button", { name });

function rollAndWaitForPopup(drug: RegExp) {
  fireEvent.click(button(drug));
  fireEvent.click(button(/^Roll the ball/), { detail: 0 });
  act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
  expect(playEnding).not.toHaveBeenCalled(); // not before the pop-up shows
  act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
}

describe("end-of-game sounds", () => {
  it("chimes once as the question pops up", () => {
    render(<GameShell />);
    expect(playQuestion).not.toHaveBeenCalled();
    fireEvent.click(button(/start game/i));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(playQuestion).toHaveBeenCalledTimes(1);
    fireEvent.click(button(/^Choose a ball$/));
    fireEvent.click(button(/^Azithromycin/));
    expect(playQuestion).toHaveBeenCalledTimes(1); // not again while playing
  });

  it("plays the losing sound once when pins are left standing", () => {
    render(<GameShell />);
    fireEvent.click(button(/start game/i));
    fireEvent.click(button(/^Choose a ball$/));
    rollAndWaitForPopup(/^Azithromycin/);
    expect(screen.getByText("Unfortunately pins are still up")).toBeInTheDocument();
    expect(playEnding).toHaveBeenCalledTimes(1);
    expect(playEnding).toHaveBeenCalledWith("lost");
  });

  it("plays the confetti sound once on a win", () => {
    render(<GameShell />);
    fireEvent.click(button(/start game/i));
    fireEvent.click(button(/^Choose a ball$/));
    rollAndWaitForPopup(/^Nafithromycin/);
    expect(screen.getByText("You have won the game")).toBeInTheDocument();
    expect(playEnding).toHaveBeenCalledTimes(1);
    expect(playEnding).toHaveBeenCalledWith("won");
  });
});

import { act, fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DISCLAIMER, FOOTER_NOTE } from "@/data/gameData";
import { END_POPUP_DELAY_MS, ROLL_TOTAL_MS } from "@/lib/timing";
import { mediaState } from "@/test/setup";
import { GameShell } from "./GameShell";

beforeEach(() => {
  mediaState.reducedMotion = false;

  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  vi.useRealTimers();
});

const click = (el: HTMLElement) => fireEvent.click(el);
const button = (name: RegExp) => screen.getByRole("button", { name });

function startGame() {
  render(<GameShell />);
  click(button(/start game/i));
}

/** The footer's disclaimer line; also checks the teaching-model note is there with it. */
const disclaimer = () => {
  expect(screen.getByText(FOOTER_NOTE)).toBeVisible();
  return screen.getByText(DISCLAIMER);
};

/** Drags a pointer upwards by dy px (and sideways by dx) over the lane. */
function swipe(zone: HTMLElement, { dy, dx = 0 }: { dy: number; dx?: number }) {
  const x = 400;
  const y = 400;
  fireEvent.pointerDown(zone, { pointerId: 1, clientX: x, clientY: y });
  fireEvent.pointerMove(zone, { pointerId: 1, clientX: x + dx / 2, clientY: y - dy / 2 });
  fireEvent.pointerMove(zone, { pointerId: 1, clientX: x + dx, clientY: y - dy });
  fireEvent.pointerUp(zone, { pointerId: 1, clientX: x + dx, clientY: y - dy });
}

describe("GameShell", () => {
  it("shows the disclaimer on the intro and every game state", async () => {
    render(<GameShell />);
    expect(disclaimer()).toBeVisible();
    click(button(/start game/i));
    expect(disclaimer()).toBeVisible();
    click(button(/^Azithromycin/));
    click(button(/^Roll the ball/));
    expect(disclaimer()).toBeVisible(); // rolling
    act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
    expect(disclaimer()).toBeVisible(); // result
    click(button(/^Pin 3, /));
    expect(disclaimer()).toBeInTheDocument(); // pathogen detail
    fireEvent.keyDown(document, { key: "Escape" });
    act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
    expect(screen.getByText("Unfortunately pins are still up")).toBeInTheDocument();
    expect(disclaimer()).toBeVisible(); // try-again pop-up
  });

  it("falls back to the 2D lane without WebGL, with all eight pins operable", async () => {
    startGame();
    expect(screen.getByTestId("lane-2d")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Pin \d, / })).toHaveLength(8);
  });

  it("starts with sound on, and the switch turns it off", async () => {
    startGame();
    const toggle = screen.getByRole("switch", { name: /sound/i });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("only lets the ball roll once one is picked, then runs the full flow", async () => {
    startGame();
    const ballControl = screen.getByRole("button", { name: /^Roll the ball/ });
    expect(ballControl).toBeDisabled();
    expect(screen.getByText("Choose a ball to roll")).toBeInTheDocument();

    click(button(/^Azithromycin/));
    expect(ballControl).toBeEnabled();
    swipe(screen.getByTestId("swipe-zone"), { dy: 160 });

    // While rolling: the ball is locked and no result is shown yet.
    expect(screen.getByRole("button", { name: /^Roll the ball/ })).toBeDisabled();
    expect(screen.queryByText(/Pin 2 stood/)).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Azithromycin: 5 of 8 pins down. Pins 2, 3 and 4 are still standing.",
    );
    // Only the standing pins keep their name tags on the lane.
    expect(screen.getAllByRole("button", { name: /^Pin \d, / }).map((b) => b.getAttribute("aria-label")?.slice(0, 5))).toEqual([
      "Pin 2",
      "Pin 3",
      "Pin 4",
    ]);
    // Pins left standing: no explanation card and no ball rack, then the try-again page.
    expect(screen.queryByText(/Pin 2 stood:/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Clarithromycin/ })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
    expect(screen.getByText("Unfortunately pins are still up")).toBeInTheDocument();
    expect(screen.getByText("Thanks for attempting")).toBeInTheDocument();
    const popup = screen.getByRole("dialog");
    expect(within(popup).getByText(/Still standing · 3 of 8 pins/)).toBeInTheDocument();
    expect(within(popup).getByText("Spn-mef")).toBeInTheDocument();
    expect(within(popup).getByText("Spn-erm")).toBeInTheDocument();
    expect(within(popup).getByText("Spy-erm")).toBeInTheDocument();
    expect(screen.getByAltText(/MIQNAF/)).toBeInTheDocument();

    // One ball per player: "Try again" restarts the game for the next player.
    click(button(/try again/i));
    expect(button(/start game/i)).toBeInTheDocument();
  });

  it("returns to the start screen on its own if nobody taps the pop-up", () => {
    startGame();
    click(button(/^Azithromycin/));
    click(button(/^Roll the ball/));
    act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
    act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
    expect(screen.getByText(/Back to the start screen in 20s/)).toBeInTheDocument();
    for (let i = 0; i < 20; i++) act(() => vi.advanceTimersByTime(1000));
    expect(button(/start game/i)).toBeInTheDocument();

    // The next player's pop-up gets the full countdown again.
    click(button(/start game/i));
    click(button(/^Clarithromycin/));
    click(button(/^Roll the ball/));
    act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
    act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
    expect(screen.getByText(/Back to the start screen in 20s/)).toBeInTheDocument();
  });

  it("does not roll on a tap, a short drag or a sideways swipe", () => {
    startGame();
    click(button(/^Nafithromycin/));
    const zone = screen.getByTestId("swipe-zone");

    fireEvent.click(button(/^Roll the ball/), { detail: 1 }); // a finger tap on the ball
    swipe(zone, { dy: 10 }); // too short
    swipe(zone, { dy: 60, dx: 200 }); // mostly sideways
    swipe(zone, { dy: -150 }); // downwards

    // Still waiting for a swipe: nothing rolled.
    expect(screen.getByText("Swipe the ball up to roll")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Clarithromycin/ })).toBeEnabled();
  });

  it("reduced motion shows the end state immediately, then the win pop-up", () => {
    mediaState.reducedMotion = true;
    startGame();
    click(button(/^Nafithromycin/));
    click(button(/^Roll the ball/));
    expect(screen.getByRole("status")).toHaveTextContent("Nafithromycin: 8 of 8 pins down. No pins are standing.");
    expect(screen.queryAllByRole("button", { name: /^Pin \d, / })).toHaveLength(0);

    // All pins down: after a short pause, the win pop-up.
    expect(screen.queryByText("You have won the game")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
    expect(screen.getByText("You have won the game")).toBeInTheDocument();
    expect(screen.getByText("Thank you for playing")).toBeInTheDocument();
    expect(screen.getByAltText(/MIQNAF/)).toBeInTheDocument();
    click(button(/back to start/i));
    expect(button(/start game/i)).toBeInTheDocument();
  });

  it("is operable from the keyboard", async () => {
    vi.useRealTimers();
    mediaState.reducedMotion = true;
    const user = userEvent.setup();
    render(<GameShell />);
    screen.getByRole("button", { name: /start game/i }).focus();
    await user.keyboard("{Enter}");
    screen.getByRole("button", { name: /^Clarithromycin/ }).focus();
    await user.keyboard(" ");
    screen.getByRole("button", { name: /^Roll the ball/ }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("Clarithromycin: 5 of 8 pins down.");
  });

  it("pathogen card shows the pin details without per-ball outcomes, and closes on Escape", async () => {
    vi.useRealTimers();
    mediaState.reducedMotion = true;
    startGame();
    click(button(/^Azithromycin/));
    click(button(/^Roll the ball/));
    click(button(/^Pin 2, /));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Pin 2 · Spn-mef")).toBeInTheDocument();
    expect(within(dialog).getByText(/Efflux strains are macrolide-resistant/)).toBeInTheDocument();
    expect(within(dialog).queryByText(/Outcome by ball/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Not yet rolled")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  it("opens a pin's card from the pin key, but not while the ball is rolling", async () => {
    vi.useRealTimers();
    startGame();
    click(button(/^Pathogen card for pin 7, Cp/));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Pin 7 · Cp")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));

    click(button(/^Nafithromycin/));
    fireEvent.click(button(/^Roll the ball/), { detail: 0 });
    expect(button(/^Pathogen card for pin 7/)).toBeDisabled();
  });

  it("has no coverage board", () => {
    startGame();
    expect(screen.queryByRole("button", { name: /coverage board/i })).not.toBeInTheDocument();
  });
});

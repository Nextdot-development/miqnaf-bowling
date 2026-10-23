import { act, fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DISCLAIMER } from "@/data/gameData";
import { ROLL_TOTAL_MS } from "@/lib/timing";
import { mediaState } from "@/test/setup";
import { GameShell } from "./GameShell";

beforeEach(() => {
  mediaState.reducedMotion = false;
  // Only the roll timer is faked; animation frames stay real.
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

const disclaimer = () => screen.getByText(DISCLAIMER);

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
    vi.useRealTimers();
    expect(disclaimer()).toBeVisible(); // result
    click(await screen.findByRole("button", { name: /^Pin 3 stood/ }));
    expect(disclaimer()).toBeInTheDocument(); // pathogen detail
    fireEvent.keyDown(document, { key: "Escape" });
    click(button(/open the coverage board/i));
    expect(disclaimer()).toBeVisible(); // coverage
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
    expect(screen.getByText("Pick a ball below")).toBeInTheDocument();

    click(button(/^Azithromycin/));
    expect(ballControl).toBeEnabled();
    swipe(screen.getByTestId("swipe-zone"), { dy: 160 });

    // While rolling: the ball is locked and no result is shown yet.
    expect(screen.getByRole("button", { name: /^Roll the ball/ })).toBeDisabled();
    expect(screen.queryByText(/Pin 2 stood/)).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
    vi.useRealTimers();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Azithromycin: 5 of 8 pins down. Pins 2, 3 and 4 are still standing.",
    );
    expect(await screen.findByText(/Pin 2 stood:/)).toBeInTheDocument();
    expect(screen.getByText(/Pin 3 stood:/)).toBeInTheDocument();
    expect(screen.getByText(/Pin 4 stood:/)).toBeInTheDocument();
    expect(screen.getByText(/How often do you meet macrolide-resistant pneumococci/)).toBeInTheDocument();
    // The result replaces the ball cards; "Choose another ball" brings them back.
    expect(screen.queryByRole("button", { name: /^Clarithromycin/ })).not.toBeInTheDocument();
    click(button(/choose another ball/i));
    expect(await screen.findByRole("button", { name: /^Clarithromycin/ })).toBeEnabled();
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

  it("reduced motion shows the end state immediately", async () => {
    vi.useRealTimers();
    mediaState.reducedMotion = true;
    startGame();
    click(button(/^Nafithromycin/));
    click(button(/^Roll the ball/));
    expect(screen.getByRole("status")).toHaveTextContent("Nafithromycin: 8 of 8 pins down. No pins are standing.");
    expect(await screen.findByText("None. All eight pins fell on this roll.")).toBeInTheDocument();
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

  it("pathogen card hides outcomes for balls not yet rolled, and closes on Escape", async () => {
    vi.useRealTimers();
    mediaState.reducedMotion = true;
    startGame();
    click(button(/^Azithromycin/));
    click(button(/^Roll the ball/));
    click(await screen.findByRole("button", { name: /^Pin 2 stood/ }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Pin 2 · Spn-mef")).toBeInTheDocument();
    expect(within(dialog).getByText(/Efflux strains are macrolide-resistant/)).toBeInTheDocument();
    expect(within(dialog).getByText("Standing")).toBeInTheDocument();
    expect(within(dialog).getAllByText("Not yet rolled")).toHaveLength(2);
    expect(within(dialog).queryByText("Down")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  it("coverage board respects reveal rules unless the reference view is chosen", async () => {
    vi.useRealTimers();
    mediaState.reducedMotion = true;
    startGame();
    click(button(/^Azithromycin/));
    click(button(/^Roll the ball/));
    click(button(/open the coverage board/i));

    const table = screen.getByRole("table");
    expect(within(table).getAllByText("Not yet rolled")).toHaveLength(16);
    expect(
      screen.getByText("Looking at the grid, which gap matters most for the patients you see?"),
    ).toBeInTheDocument();

    click(screen.getByRole("radio", { name: /full reference matrix/i }));
    expect(within(table).queryByText("Not yet rolled")).not.toBeInTheDocument();
    expect(within(table).getAllByText("Standing")).toHaveLength(6);
  });
});

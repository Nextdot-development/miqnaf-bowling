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

/** Closes the question that pops up when the lane opens. */
const closeQuestion = () => click(button(/^Choose a ball$/));

function startGame() {
  render(<GameShell />);
  click(button(/start game/i));
  closeQuestion();
}

/** Picks a ball, rolls it, and waits for the lane to settle and the pop-up to open. */
function throwBall(ball: RegExp) {
  click(button(ball));
  click(button(/^Roll the ball/));
  act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
  act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
}

const laneTags = () => screen.queryAllByRole("button", { name: /^Pin \d, / }).map((b) => b.getAttribute("aria-label")?.slice(0, 5));

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
    expect(disclaimer()).toBeVisible(); // question pop-up
    closeQuestion();
    expect(disclaimer()).toBeVisible();
    click(button(/^Azithromycin/));
    click(button(/^Roll the ball/));
    expect(disclaimer()).toBeVisible(); // rolling
    act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
    expect(disclaimer()).toBeVisible(); // result
    click(button(/^Pin 1, /));
    expect(disclaimer()).toBeInTheDocument(); // pin card
    fireEvent.keyDown(document, { key: "Escape" });
    act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
    expect(screen.getByText("Good coverage, but some critical respiratory challenges remain.")).toBeInTheDocument();
    expect(disclaimer()).toBeVisible(); // between rounds
    click(button(/^Round 2/));
    throwBall(/^Amox.clav/);
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

  it("only lets the ball roll once one is picked", () => {
    startGame();
    const ballControl = screen.getByRole("button", { name: /^Roll the ball/ });
    expect(ballControl).toBeDisabled();
    expect(screen.getByText("Choose a ball to roll")).toBeInTheDocument();
    expect(screen.getAllByText("Which options would you choose to knock off all the pins for treatment of CABP?").length).toBeGreaterThan(0);
    click(button(/^Azithromycin/));
    expect(ballControl).toBeEnabled();
    swipe(screen.getByTestId("swipe-zone"), { dy: 160 });
    expect(screen.getByRole("button", { name: /^Roll the ball/ })).toBeDisabled(); // locked while rolling
  });

  it("scenario 1: azithromycin, then amox/clav in round 2, leaves pins up", () => {
    startGame();
    click(button(/^Azithromycin/));
    click(button(/^Roll the ball/));
    act(() => vi.advanceTimersByTime(ROLL_TOTAL_MS + 10));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Round 1, Azithromycin: 4 of 8 pins down. Pins 1, 5, 6 and 8 are still standing.",
    );
    expect(laneTags()).toEqual(["Pin 1", "Pin 5", "Pin 6", "Pin 8"]); // only standing pins keep tags

    // Between rounds: the message, what is left, and the evidence. No restart countdown.
    act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
    let popup = screen.getByRole("dialog");
    expect(within(popup).getByText("Good coverage, but some critical respiratory challenges remain.")).toBeInTheDocument();
    expect(within(popup).getByText(/Round 1 · 4 of 8 pins down/)).toBeInTheDocument();
    expect(within(popup).getByText(/Still standing · 4 of 8 pins/)).toBeInTheDocument();
    expect(within(popup).getByLabelText("Evidence")).toHaveTextContent("Paukner S et al., 2024");
    expect(within(popup).queryByText(/Back to the start screen/)).not.toBeInTheDocument();

    // Round 2: fallen pins cleared, and only the two other balls on offer.
    click(button(/^Round 2/));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Round 2 · Choose your ball");
    expect(screen.queryByRole("button", { name: /^Azithromycin/ })).not.toBeInTheDocument();
    expect(button(/^Nafithromycin/)).toBeEnabled();
    expect(laneTags()).toEqual(["Pin 1", "Pin 5", "Pin 6", "Pin 8"]);

    // Amox/clav knocks one more pin (Bactericidal actions).
    throwBall(/^Amox.clav/);
    expect(screen.getByRole("status")).toHaveTextContent("Round 2, Amox/clav: 5 of 8 pins down. Pins 1, 6 and 8 are still standing.");
    popup = screen.getByRole("dialog");
    expect(within(popup).getByText("Unfortunately pins are still up")).toBeInTheDocument();
    expect(within(popup).getByText("One additional pin down. Some critical challenges remain unresolved.")).toBeInTheDocument();
    expect(within(popup).getByText(/Still standing · 3 of 8 pins/)).toBeInTheDocument();
    expect(within(popup).getByAltText(/MIQNAF/)).toBeInTheDocument();
    click(button(/try again/i));
    expect(button(/start game/i)).toBeInTheDocument();
  });

  it("scenario 1: azithromycin, then nafithromycin in round 2, is a strike", () => {
    startGame();
    throwBall(/^Azithromycin/);
    click(button(/^Round 2/));
    throwBall(/^Nafithromycin/);
    const popup = screen.getByRole("dialog");
    expect(within(popup).getByText("STRIKE!")).toBeInTheDocument();
    expect(within(popup).getByText("Perfect Strike Through Comprehensive Coverage")).toBeInTheDocument();
    expect(within(popup).getByLabelText("Evidence")).toHaveTextContent("post-antibiotic effect");
    expect(within(popup).getByText(/You have won the game/)).toBeInTheDocument();
  });

  it("scenario 2: amox/clav half-knocks Bactericidal, then azithromycin leaves pins up", () => {
    startGame();
    throwBall(/^Amox.clav/);
    let popup = screen.getByRole("dialog");
    expect(within(popup).getByText("Not all respiratory challenges have been addressed.")).toBeInTheDocument();
    expect(within(popup).getByText(/Round 1 · 1 of 8 pins down/)).toBeInTheDocument();
    expect(within(popup).getByText("50% down")).toBeInTheDocument(); // Bactericidal rocked but stayed up
    expect(within(popup).getByLabelText("Evidence")).toHaveTextContent("Owens RC Jr, 2008");
    click(button(/^Round 2/));
    expect(screen.queryByRole("button", { name: /^Amox.clav/ })).not.toBeInTheDocument();
    throwBall(/^Azithromycin/);
    popup = screen.getByRole("dialog");
    expect(within(popup).getByText("Some pins still standing")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Round 2, Azithromycin: 4 of 8 pins down. Pins 1, 5, 6 and 8 are still standing.");
  });

  it("scenario 2: amox/clav, then nafithromycin in round 2, is a strike", () => {
    startGame();
    throwBall(/^Amox.clav/);
    click(button(/^Round 2/));
    throwBall(/^Nafithromycin/);
    expect(within(screen.getByRole("dialog")).getByText("All pins down")).toBeInTheDocument();
  });

  it("returns to the start screen on its own if nobody taps the final pop-up", () => {
    startGame();
    throwBall(/^Nafithromycin/);
    expect(screen.getByText(/Back to the start screen in 20s/)).toBeInTheDocument();
    for (let i = 0; i < 20; i++) act(() => vi.advanceTimersByTime(1000));
    expect(button(/start game/i)).toBeInTheDocument();

    // The next player's pop-up gets the full countdown again.
    click(button(/start game/i));
    closeQuestion();
    throwBall(/^Nafithromycin/);
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
    expect(screen.getByRole("button", { name: /^Amox.clav/ })).toBeEnabled();
  });

  it("scenario 3: nafithromycin in round 1 is a strike (reduced motion shows the end state at once)", () => {
    mediaState.reducedMotion = true;
    startGame();
    click(button(/^Nafithromycin/));
    click(button(/^Roll the ball/));
    expect(screen.getByRole("status")).toHaveTextContent("Round 1, Nafithromycin: 8 of 8 pins down. No pins are standing.");
    expect(laneTags()).toHaveLength(0);

    expect(screen.queryByText("STRIKE!")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(END_POPUP_DELAY_MS + 10));
    const popup = screen.getByRole("dialog");
    expect(within(popup).getByText("STRIKE!")).toBeInTheDocument();
    expect(within(popup).getByText("All 8 pins down in a single throw.")).toBeInTheDocument();
    expect(within(popup).getByText("One Molecule. Multiple Respiratory Challenges Addressed.")).toBeInTheDocument();
    expect(within(popup).getByText(/You have won the game · Thank you for playing/)).toBeInTheDocument();
    expect(within(popup).getByAltText(/MIQNAF/)).toBeInTheDocument();
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
    await user.keyboard("{Enter}"); // the question pop-up opens with focus on its first button
    expect(screen.queryByText("Which options would you choose to knock off all the pins for treatment of CABP?", { selector: "h2" })).not.toBeInTheDocument();
    screen.getByRole("button", { name: /^Amox.clav/ }).focus();
    await user.keyboard(" ");
    screen.getByRole("button", { name: /^Roll the ball/ }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("Round 1, Amox/clav: 1 of 8 pins down.");
  });

  it("pin card shows the pin details without per-ball outcomes, and closes on Escape", async () => {
    vi.useRealTimers();
    mediaState.reducedMotion = true;
    startGame();
    click(button(/^Azithromycin/));
    click(button(/^Roll the ball/));
    click(button(/^Pin 1, /));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading")).toHaveTextContent("MDR S. pneumoniae coverage");
    expect(within(dialog).getByLabelText("Pin 1")).toHaveTextContent("1"); // the pin number badge
    // Only the full wording: no pin number/label line and no other sections.
    expect(within(dialog).queryByText(/Pin 1 ·/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/Why it matters/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /back to the game/i })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(within(dialog).queryByText(/Outcome by ball/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Not yet rolled")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  it("opens a pin's card from the pin key, but not while the ball is rolling", async () => {
    vi.useRealTimers();
    startGame();
    click(button(/^Card for pin 7, Anti-inflam/));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading")).toHaveTextContent("Anti-inflammatory activity");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));

    click(button(/^Nafithromycin/));
    fireEvent.click(button(/^Roll the ball/), { detail: 0 });
    expect(button(/^Card for pin 7/)).toBeDisabled();
  });

  it("asks the question in a pop-up first, then keeps it on the lane", () => {
    render(<GameShell />);
    click(button(/start game/i));
    const popup = screen.getByRole("dialog");
    expect(within(popup).getByText("Which options would you choose to knock off all the pins for treatment of CABP?")).toBeInTheDocument();
    // It lists the eight pins under the question.
    expect(within(popup).getByText("Your pins")).toBeInTheDocument();
    for (const name of ["Atypical coverage", "Safety for paediatric and elderly", "High lung levels", "Bactericidal actions", "PK/PD supporting short course therapy", "Anti-inflammatory activity", "Monotherapy"]) {
      expect(within(popup).getByText(name)).toBeInTheDocument();
    }
    expect(within(popup).getAllByRole("listitem")).toHaveLength(8);
    closeQuestion();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("Which options would you choose to knock off all the pins for treatment of CABP?").length).toBeGreaterThan(0); // on the lane (kiosk) or above it
  });

  it("has no coverage board", () => {
    startGame();
    expect(screen.queryByRole("button", { name: /coverage board/i })).not.toBeInTheDocument();
  });
});

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DRUGS, PRE_ROLL_QUESTION, ROUND_ONE_FEEDBACK, ROUND_TWO_MESSAGE, STRIKE, type FirstMissDrug } from "@/data/gameData";
import { useGameState } from "@/hooks/useGameState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { joinPinNumbers, laneBefore, rollLane, richToPlain } from "@/lib/gameLogic";
import { validateOutcomeMatrix } from "@/lib/outcomeValidation";
import { END_POPUP_DELAY_MS } from "@/lib/timing";
import type { LanePin, Pin } from "@/types/game";
import { Dialog } from "@/components/ui/Dialog";
import { AccessiblePinList } from "./AccessiblePinList";
import { BallRack } from "./BallRack";
import { EndScreen, type EndOutcome } from "./EndScreen";
import { GameFooter } from "./GameFooter";
import { GameHeader } from "./GameHeader";
import { GameStage } from "./GameStage";
import { IntroScreen } from "./IntroScreen";
import { PathogenInfoDialog } from "./PathogenInfoDialog";
import { PinKey } from "./PinKey";
import { QuestionPopup } from "./QuestionPopup";

if (process.env.NODE_ENV !== "production") {
  const errors = validateOutcomeMatrix();
  if (errors.length) console.error("Outcome matrix validation failed:", errors);
}

interface GameShellProps {
  /** Force the 2D lane (tests / manual fallback). */
  force2D?: boolean;
}

export function GameShell({ force2D = false }: GameShellProps) {
  const reducedMotion = useReducedMotion();
  const game = useGameState(reducedMotion);
  const { state } = game;
  const [confirmReset, setConfirmReset] = useState(false);

  // Touch kiosk: a long press should not open the browser's context menu.
  useEffect(() => {
    if (!window.matchMedia?.("(pointer: coarse)").matches) return;
    const block = (e: Event) => e.preventDefault();
    window.addEventListener("contextmenu", block);
    return () => window.removeEventListener("contextmenu", block);
  }, []);

  // Every pin's state right now: cleared ones are gone in round 2; during and
  // after a throw, which fall, which wobble and which stay up.
  const lane = useMemo(() => {
    if (state.phase === "result" && state.result) return state.result.lane;
    if (state.phase === "rolling" && state.selectedDrug) return rollLane(state.selectedDrug, state.cleared);
    return laneBefore(state.cleared);
  }, [state.phase, state.result, state.selectedDrug, state.cleared]);

  // Pin labels' accessible names; include the outcome once it is revealed.
  const showStatus = state.phase === "result";
  const pinName = useCallback(
    (pin: Pin) => {
      const said: Record<LanePin, string> = { up: "Standing", down: "Down", wobble: "Wobbled, still standing", cleared: "Down in round 1" };
      const status = showStatus ? ` ${said[lane[pin.number]]}.` : "";
      return `Pin ${pin.number}, ${pin.label}: ${richToPlain(pin.name)}.${status} Open pin card.`;
    },
    [showStatus, lane],
  );
  const onPinSelect = useCallback((pin: Pin) => game.openPin(pin.number), [game]);

  const announcement = useMemo(() => {
    if (state.phase === "rolling" && state.selectedDrug) return `Rolling ${DRUGS[state.selectedDrug].name}.`;
    if (state.phase === "result" && state.result) {
      const r = state.result;
      const standing = r.standing.length
        ? `Pins ${joinPinNumbers(r.standing)} are still standing.`
        : "No pins are standing.";
      return `Round ${r.round}, ${DRUGS[r.drug].name}: ${r.pinsDown} of ${r.totalPins} pins down. ${standing}`;
    }
    return "";
  }, [state.phase, state.selectedDrug, state.result]);

  const title =
    state.phase === "rolling"
      ? "Ball roll"
      : state.phase === "result" && state.result
        ? `Result · ${DRUGS[state.result.drug].name}`
        : `Round ${state.round} · Choose your ball`;

  
  // After each throw the lane shows the pins briefly, then a pop-up: STRIKE
  // (all down), the round 1 explanation (pins left, round 2 to come), or
  // "pins are still up" after round 2.
  const [ending, setEnding] = useState<EndOutcome | null>(null);
  const outcome: EndOutcome | null =
    state.phase === "result" && state.result
      ? state.result.standing.length === 0
        ? "won"
        : state.result.round === 1
          ? "round"
          : "lost"
      : null;
  const overlayOpen = state.openPin !== null;
  useEffect(() => {
    if (!outcome || overlayOpen) return;
    const t = setTimeout(() => setEnding(outcome), END_POPUP_DELAY_MS);
    return () => clearTimeout(t);
  }, [outcome, overlayOpen, state.result?.rollId]);
  const shownEnding = state.phase === "result" ? ending : null;

  // Confetti pops and a chime for a win, a soft "wah-wah" for pins left
  // standing: once, as the pop-up appears (and only with sound on).
  const { playEnding } = game;
  useEffect(() => {
    if (shownEnding === "won" || shownEnding === "lost") playEnding(shownEnding);
  }, [shownEnding, playEnding]);

  // Wording for the pop-up, from the scenario copy.
  const firstDrug = state.rolledDrugs[0];
  const endCopy = useMemo(() => {
    const r = state.result;
    if (!r) return {};
    if (r.standing.length === 0) {
      return r.round === 1 || !firstDrug || firstDrug === "nafithromycin"
        ? { message: STRIKE.firstThrow, tagline: STRIKE.tagline, evidence: STRIKE.evidence }
        : { message: ROUND_TWO_MESSAGE[firstDrug as FirstMissDrug].nafithromycin, evidence: STRIKE.evidence };
    }
    if (r.round === 1) return ROUND_ONE_FEEDBACK[r.drug as FirstMissDrug];
    return { message: firstDrug && firstDrug !== "nafithromycin" ? ROUND_TWO_MESSAGE[firstDrug as FirstMissDrug][r.drug] : undefined };
  }, [state.result, firstDrug]);

  const nextRound = useCallback(() => {
    setEnding(null);
    game.nextRound();
  }, [game]);

  // The pre-roll question pops up once per player, when the lane first opens.
  const [questionSeen, setQuestionSeen] = useState(false);
  useEffect(() => {
    if (state.phase === "intro") setQuestionSeen(false);
  }, [state.phase]);
  const showQuestion = state.phase === "selecting" && !questionSeen;

  // A soft chime as the question pops up (only with sound on).
  const { playQuestion } = game;
  useEffect(() => {
    if (showQuestion) playQuestion();
  }, [showQuestion, playQuestion]);

  const restart = useCallback(() => {
    setEnding(null);
    game.newSession();
  }, [game]);

  return (
    <div className="flex min-h-[100dvh] flex-col kiosk:h-[100dvh] kiosk:overflow-hidden">
      {state.phase === "intro" ? (
        <IntroScreen onStart={game.start} pinName={pinName} />
      ) : (
        <>
          <GameHeader
            title={title}
            soundOn={state.soundOn}
            onSoundChange={game.setSound}
            onNewSession={() => setConfirmReset(true)}
          />
          <main className="mx-auto flex w-full flex-1 flex-col px-4 py-5 sm:px-8 lg:px-12 lg:py-7 kiosk:min-h-0 kiosk:px-[2.5rem] kiosk:py-[1.5rem]">
            {/* Full-width lane. On the kiosk the ball rack floats over its left
                edge and the pin key over its right edge; on smaller screens they
                sit above and below it. */}
            <div className="relative flex flex-col gap-5 kiosk:min-h-0 kiosk:flex-1">
              <GameStage
                phase={state.phase}
                selectedDrug={state.selectedDrug}
                result={state.result}
                rollStartedAt={state.rollStartedAt}
                interactive={state.phase === "selecting" || state.phase === "result"}
                pinName={pinName}
                onPinSelect={onPinSelect}
                lane={lane}
                onRoll={game.roll}
                force2D={force2D}
                className="aspect-[4/3] w-full sm:aspect-[16/9] kiosk:aspect-auto kiosk:min-h-0 kiosk:flex-1"
                wrapperClassName="kiosk:min-h-0 kiosk:flex-1"
              />
              <AccessiblePinList lane={lane} showOutcome={state.phase === "result"} />
              {state.phase === "selecting" && (
                <section
                  aria-label="Question"
                  className="order-first rounded-2xl bg-brand-navy px-5 py-3.5 text-center text-white kiosk:hidden"
                >
                  <p className="eyebrow text-brand-gold">Question</p>
                  <p className="mt-1 text-base font-bold leading-snug sm:text-lg">{PRE_ROLL_QUESTION}</p>
                </section>
              )}
              <BallRack
                phase={state.phase}
                selectedDrug={state.selectedDrug}
                rolledDrugs={state.rolledDrugs}
                round={state.round}
                onSelect={game.selectDrug}
                className="order-first rounded-3xl bg-brand-navy p-4 kiosk:absolute kiosk:left-[1.5rem] kiosk:top-[1.5rem] kiosk:z-20 kiosk:w-[min(22rem,24%)] kiosk:bg-transparent kiosk:p-0"
              />
              <PinKey
                onOpenPin={game.openPin}
                disabled={state.phase === "rolling"}
                cleared={state.cleared}
                className="kiosk:absolute kiosk:right-[1.5rem] kiosk:top-[1.5rem] kiosk:z-20 kiosk:w-[min(24rem,25%)]"
              />
            </div>
          </main>
        </>
      )}

      <GameFooter />

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <EndScreen
        outcome={shownEnding}
        message={endCopy.message}
        tagline={"tagline" in endCopy ? endCopy.tagline : undefined}
        evidence={"evidence" in endCopy ? endCopy.evidence : null}
        pinsDown={state.result?.pinsDown}
        standing={state.result?.standing}
        wobbled={state.result ? state.result.standing.filter((n) => state.result!.lane[n] === "wobble") : []}
        onRestart={restart}
        onNextRound={nextRound}
      />

      <PathogenInfoDialog pinNumber={state.openPin} onClose={game.closePin} />

      {/* The question pops up first when the lane opens; once closed it stays
          on the lane (top card) while the player chooses and swipes. */}
      <QuestionPopup open={showQuestion} question={PRE_ROLL_QUESTION} onClose={() => setQuestionSeen(true)} />

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Start a new game?"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn-outline justify-center px-6 py-3" onClick={() => setConfirmReset(false)}>
              Keep playing
            </button>
            <button
              type="button"
              className="btn-primary px-6 py-3 text-lg normal-case tracking-normal"
              onClick={() => {
                setConfirmReset(false);
                game.newSession();
              }}
            >
              Start new game
            </button>
          </div>
        }
      >
        <p className="text-lg text-ink-muted">
          This clears the balls rolled and discussion points shown, and returns to the start screen for the next participant.
        </p>
      </Dialog>
    </div>
  );
}

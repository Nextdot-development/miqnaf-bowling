"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DRUGS } from "@/data/gameData";
import { useGameState } from "@/hooks/useGameState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { joinPinNumbers, pinStatus, richToPlain } from "@/lib/gameLogic";
import { validateOutcomeMatrix } from "@/lib/outcomeValidation";
import { allDrugsRolled } from "@/lib/promptLogic";
import type { Pin } from "@/types/game";
import { Dialog } from "@/components/ui/Dialog";
import { AccessiblePinList } from "./AccessiblePinList";
import { CoverageBoard } from "./CoverageBoard";
import { GameFooter } from "./GameFooter";
import { GameHeader } from "./GameHeader";
import { GameSidePanel } from "./GameSidePanel";
import { GameStage } from "./GameStage";
import { IntroScreen } from "./IntroScreen";
import { PathogenInfoDialog } from "./PathogenInfoDialog";

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

  // Pin labels' accessible names; include the outcome once it is revealed.
  const resultDrug = state.phase === "result" ? state.result?.drug ?? null : null;
  const pinName = useCallback(
    (pin: Pin) => {
      const status = resultDrug
        ? ` ${pinStatus(resultDrug, pin.number) === "down" ? "Down" : "Standing"} after ${DRUGS[resultDrug].name}.`
        : "";
      return `Pin ${pin.number}, ${pin.label}: ${richToPlain(pin.organism)}.${status} Open pathogen card.`;
    },
    [resultDrug],
  );
  const onPinSelect = useCallback((pin: Pin) => game.openPin(pin.number), [game]);

  const announcement = useMemo(() => {
    if (state.phase === "rolling" && state.selectedDrug) return `Rolling ${DRUGS[state.selectedDrug].name}.`;
    if (state.phase === "result" && state.result) {
      const r = state.result;
      const standing = r.standing.length
        ? `Pins ${joinPinNumbers(r.standing)} are still standing.`
        : "No pins are standing.";
      return `${DRUGS[r.drug].name}: ${r.pinsDown} of ${r.totalPins} pins down. ${standing}`;
    }
    return "";
  }, [state.phase, state.selectedDrug, state.result]);

  const title = state.coverageOpen
    ? "Pathogen coverage overview"
    : state.phase === "rolling"
      ? "Ball roll"
      : state.phase === "result" && state.result
        ? allDrugsRolled(state.rolledDrugs) && !state.coverageVisited
          ? "Try another ball?"
          : `Result · ${DRUGS[state.result.drug].name}`
        : "Choose your ball";

  const toggleCoverage = () => (state.coverageOpen ? game.closeCoverage() : game.openCoverage());

  return (
    <div className="flex min-h-[100dvh] flex-col kiosk:h-[100dvh] kiosk:overflow-hidden">
      {state.phase === "intro" ? (
        <IntroScreen onStart={game.start} pinName={pinName} />
      ) : (
        <>
          <GameHeader
            title={title}
            coverageOpen={state.coverageOpen}
            coverageDisabled={state.phase === "rolling"}
            soundOn={state.soundOn}
            onToggleCoverage={toggleCoverage}
            onSoundChange={game.setSound}
            onNewSession={() => setConfirmReset(true)}
          />
          <main className="mx-auto flex w-full flex-1 flex-col px-4 py-5 sm:px-8 lg:px-12 lg:py-7 kiosk:min-h-0 kiosk:px-[2.5rem] kiosk:py-[1.5rem]">
            {state.coverageOpen ? (
              <CoverageBoard
                mode={state.coverageMode}
                rolledDrugs={state.rolledDrugs}
                promptId={state.coveragePromptId}
                onModeChange={game.setCoverageMode}
                onOpenPin={game.openPin}
                onClose={game.closeCoverage}
              />
            ) : (
              <div className="grid gap-5 kiosk:min-h-0 kiosk:flex-1 kiosk:grid-cols-[minmax(0,1fr)_minmax(24rem,31%)] kiosk:gap-[2rem]">
                <div className="flex min-w-0 flex-col kiosk:min-h-0">
                  <GameStage
                    phase={state.phase}
                    selectedDrug={state.selectedDrug}
                    result={state.result}
                    rollStartedAt={state.rollStartedAt}
                    interactive={state.phase === "selecting" || state.phase === "result"}
                    pinName={pinName}
                    onPinSelect={onPinSelect}
                    onRoll={game.roll}
                    force2D={force2D}
                    className="aspect-[4/3] w-full sm:aspect-[16/9] kiosk:aspect-auto kiosk:min-h-0 kiosk:flex-1"
                    wrapperClassName="kiosk:min-h-0 kiosk:flex-1"
                  />
                  <AccessiblePinList phase={state.phase} drug={state.result?.drug ?? null} />
                </div>
                <GameSidePanel
                  state={state}
                  onSelectDrug={game.selectDrug}
                  onChooseAnother={game.chooseAnother}
                  onOpenCoverage={game.openCoverage}
                  onOpenPin={game.openPin}
                />
              </div>
            )}
          </main>
        </>
      )}

      <GameFooter />

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <PathogenInfoDialog pinNumber={state.openPin} rolledDrugs={state.rolledDrugs} onClose={game.closePin} />

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

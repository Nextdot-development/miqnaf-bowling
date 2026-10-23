"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RefreshCw, Table2 } from "lucide-react";
import { DRUGS } from "@/data/gameData";
import { allDrugsRolled } from "@/lib/promptLogic";
import { BALL_TRAVEL_MS } from "@/lib/timing";
import { BALL_COLORS } from "@/lib/drugVisuals";
import type { CSSProperties } from "react";
import type { GameState, PinNumber } from "@/types/game";
import { ResultPanel } from "./ResultPanel";
import { RollButton } from "./RollButton";
import { StepIndicator } from "./StepIndicator";

interface GameSidePanelProps {
  state: GameState;
  onRoll: () => void;
  onChooseAnother: () => void;
  onOpenCoverage: () => void;
  onOpenPin: (n: PinNumber) => void;
}

export function GameSidePanel({
  state,
  onRoll,
  onChooseAnother,
  onOpenCoverage,
  onOpenPin,
}: GameSidePanelProps) {
  const reduce = useReducedMotion();
  const { phase, selectedDrug, result } = state;
  const step = phase === "rolling" ? 3 : phase === "result" ? 4 : 1;
  const drug = selectedDrug ? DRUGS[selectedDrug] : null;
  const suggestBoard = phase === "result" && allDrugsRolled(state.rolledDrugs) && !state.coverageVisited;

  const fade = {
    initial: reduce ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -6 },
    transition: { duration: reduce ? 0 : 0.2 },
  } as const;

  return (
    <section
      aria-label="Game panel"
      className="flex h-full flex-col rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7 lg:p-8 kiosk:min-h-0"
    >
      <StepIndicator current={step} />

      <div className="-mx-1 mt-6 flex-1 px-1 kiosk:min-h-0 kiosk:overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "selecting" && (
            <motion.div key="select" {...fade} className="space-y-5">
              <h2 className="text-3xl font-black leading-tight text-brand-navy sm:text-[2.6rem]">
                Tap a ball to select, then tap ROLL.
              </h2>
              {drug ? (
                <div
                  className="flex items-center gap-4 rounded-2xl border-2 border-brand-gold bg-surface-tint px-5 py-4"
                  style={{ "--ball": BALL_COLORS[drug.id] } as CSSProperties}
                >
                  <span className="ball-swatch h-14 w-14 sm:h-16 sm:w-16" aria-hidden />
                  <span>
                    <span className="eyebrow block text-[color-mix(in_srgb,var(--brand-gold)_40%,black)]">
                      Selected ball
                    </span>
                    <span className="block font-display text-2xl font-black text-brand-navy sm:text-3xl">
                      {drug.name}
                    </span>
                    <span className="block font-semibold text-ink-muted">{drug.drugClass}</span>
                  </span>
                </div>
              ) : (
                <p
                  id="roll-hint"
                  className="rounded-2xl border-2 border-dashed border-line px-5 py-6 text-lg font-semibold text-ink-muted"
                >
                  No ball selected yet. Choose one of the three balls below the lane.
                </p>
              )}
              <p className="text-lg leading-relaxed text-ink-muted">
                The ball&apos;s path and speed are identical for all three. Only the pins that react differ.
              </p>
            </motion.div>
          )}

          {phase === "rolling" && drug && (
            <motion.div key="rolling" {...fade} className="space-y-6">
              <h2 className="text-3xl font-black leading-tight text-brand-navy sm:text-[2.6rem]">Watch the pins.</h2>
              <p className="text-lg leading-relaxed text-ink-muted sm:text-xl">
                {drug.name} is rolling. Same straight path and speed as every ball, about 2 seconds.
              </p>
              <div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-sunken">
                  <motion.div
                    className="h-full rounded-full bg-brand-navy"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: BALL_TRAVEL_MS / 1000, ease: "linear" }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm font-semibold text-ink-muted">
                  <span>Ball travel</span>
                  <span>2.0 s</span>
                </div>
              </div>
              <p className="flex items-baseline gap-3 text-ink-soft">
                <span className="inline-block h-2 w-10 rounded bg-ink-soft/60" aria-hidden />
                <span className="text-2xl font-semibold">of 8 pins down</span>
              </p>
            </motion.div>
          )}

          {phase === "result" && result && (
            <motion.div key={`result-${result.rollId}`} {...fade}>
              <ResultPanel result={result} rolledCount={state.rolledDrugs.length} onOpenPin={onOpenPin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 space-y-3">
        {phase === "result" ? (
          suggestBoard ? (
            <>
              <button type="button" onClick={onOpenCoverage} className="btn-primary w-full py-5 text-xl normal-case tracking-normal sm:text-2xl">
                <Table2 className="h-7 w-7" aria-hidden /> Open the coverage board
              </button>
              <button type="button" onClick={onChooseAnother} className="w-full py-2 font-semibold text-brand-navy underline underline-offset-4">
                Or choose another ball
              </button>
            </>
          ) : (
            <button type="button" onClick={onChooseAnother} className="btn-primary w-full py-5 text-xl normal-case tracking-normal sm:text-2xl">
              <RefreshCw className="h-6 w-6" strokeWidth={3} aria-hidden /> Choose another ball
            </button>
          )
        ) : (
          <RollButton canRoll={phase === "selecting" && !!selectedDrug} rolling={phase === "rolling"} onRoll={onRoll} />
        )}
      </div>
    </section>
  );
}

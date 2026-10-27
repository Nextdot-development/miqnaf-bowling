"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { DRUGS, PINS, SCORE_OUT_OF } from "@/data/gameData";
import { richToPlain } from "@/lib/gameLogic";
import type { PinNumber, RollResult } from "@/types/game";
import { BrandLogo } from "./BrandLogo";
import { Confetti } from "./Confetti";

export interface ThrowResultCopy {
  heading: string;
  /** Lines under the heading. */
  lines: readonly string[];
  /** The question to the doctor, set apart as the focus of the pop-up. */
  highlight?: string;
  button: string;
}

interface ThrowResultPopupProps {
  /** The throw to show; null hides the pop-up. */
  result: RollResult | null;
  /** Configured score for this throw (never calculated here). */
  score: number | null;
  copy: ThrowResultCopy;
  /** "strike": all pins down, heading in navy; "attempt": pins left, heading in red. */
  tone: "attempt" | "strike";
  onAction: () => void;
}

export function ThrowResultPopup({ result, score, copy, tone, onAction }: ThrowResultPopupProps) {
  const reduce = useReducedMotion();
  const button = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (result) button.current?.focus();
  }, [result]);

  const strike = tone === "strike";
  // Shaking pins stayed up, so they are listed with the rest.
  const standing = result ? PINS.filter((p) => ["up", "wobble"].includes(result.lane[p.number as PinNumber])) : [];

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" aria-hidden />
          {/* A strike: confetti over the pop-up (skipped with reduced motion). */}
          {strike && <Confetti />}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-surface text-center shadow-lift kiosk:max-w-[52rem]"
            initial={reduce ? false : { scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="tricolour-rule h-2" aria-hidden />
            <div className="flex flex-col items-center px-6 py-7 sm:px-12 sm:py-9 short:py-3 kiosk:px-[3.25rem] kiosk:py-[clamp(1.5rem,3.4vh,2.5rem)]">
              <BrandLogo logo="productLogo" className="mb-4 h-9 sm:h-11 short:mb-1.5 short:h-6 kiosk:mb-[clamp(0.8rem,2vh,1.25rem)] kiosk:h-[clamp(2.6rem,5vh,3.6rem)]" />
              {/* 1. The result */}
              <p className="eyebrow font-body kiosk:text-base">{DRUGS[result.drug].name}</p>
              <h2
                id={headingId}
                className={`mt-1.5 font-black uppercase leading-none tracking-tight short:text-[1.6rem] ${
                  strike
                    ? "text-[2.6rem] text-brand-navy sm:text-6xl kiosk:text-[clamp(3rem,7vh,4.6rem)]"
                    : "text-[2.1rem] text-brand-red sm:text-5xl kiosk:text-[clamp(2.4rem,5.4vh,3.6rem)]"
                }`}
              >
                {copy.heading}
              </h2>
              {score !== null && (
                <p className="mt-3 inline-flex items-baseline gap-2 rounded-full bg-brand-navy px-5 py-1 text-white short:mt-1.5 kiosk:mt-[0.9rem] kiosk:px-[1.4rem]">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold kiosk:text-sm">Score</span>
                  <span className="font-display text-xl font-black kiosk:text-[1.7rem]">
                    {score}/{SCORE_OUT_OF}
                  </span>
                </p>
              )}
              {strike &&
                copy.lines.map((line) => (
                  <p key={line} className="mt-2 text-lg font-bold text-brand-navy sm:text-xl kiosk:text-[clamp(1.2rem,2.4vh,1.6rem)]">
                    {line}
                  </p>
                ))}

              {/* 2. The pins */}
              {!strike && (
                standing.length > 0 && (
                  <div className="mt-6 w-full rounded-2xl bg-surface-sunken px-4 py-4 short:mt-2 short:py-2 kiosk:mt-[clamp(1.1rem,2.6vh,1.75rem)] kiosk:px-[1.4rem] kiosk:py-[clamp(0.9rem,2vh,1.25rem)]">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft kiosk:text-sm">
                      Still standing · {standing.length} of {result.totalPins}
                    </p>
                    <ul aria-label="Still standing" className="mt-3 flex flex-wrap justify-center gap-2 short:mt-1.5 kiosk:mt-[0.8rem] kiosk:gap-[0.55rem]">
                      {standing.map((p) => (
                        <li
                          key={p.number}
                          className="inline-flex items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-3 text-sm font-semibold text-brand-navy shadow-sm ring-1 ring-line kiosk:text-[1rem]"
                        >
                          <span className="pin-chip-num shrink-0">{p.number}</span>
                          {richToPlain(p.name)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}

              {/* 3. The message and the question */}
              {!strike && (
                <div className="mt-6 short:mt-2 kiosk:mt-[clamp(1.1rem,2.6vh,1.75rem)]">
                  {copy.lines.map((line) => (
                    <p key={line} className="text-base text-ink-muted sm:text-lg kiosk:text-[clamp(1.05rem,2vh,1.25rem)]">
                      {line}
                    </p>
                  ))}
                  {copy.highlight && (
                    <p className="mt-2 font-display text-2xl font-black text-brand-navy sm:text-3xl short:text-xl kiosk:text-[clamp(1.6rem,3.4vh,2.3rem)]">
                      {copy.highlight}
                    </p>
                  )}
                </div>
              )}

              {/* 4. The actions */}
              <div className="sticky bottom-0 z-10 -mb-2 mt-6 flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 bg-surface pb-2 short:mt-2 kiosk:mt-[clamp(1.1rem,2.6vh,1.75rem)]">
                <button
                  ref={button}
                  type="button"
                  onClick={onAction}
                  className="btn-primary btn-blink px-8 py-3.5 text-lg tracking-[0.06em] sm:px-10 sm:text-2xl short:py-2 short:text-lg kiosk:px-[3rem] kiosk:py-[clamp(0.9rem,2vh,1.2rem)] kiosk:text-[clamp(1.3rem,2.5vh,1.8rem)]"
                >
                  {copy.button} <ArrowRight className="h-7 w-7" strokeWidth={3} aria-hidden />
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

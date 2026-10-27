"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { DRUGS, SCORE_OUT_OF, SCORECARD_COPY, WHY_MIQNAF } from "@/data/gameData";
import type { DrugId } from "@/types/game";
import { BrandLogo } from "./BrandLogo";

interface ScorecardProps {
  open: boolean;
  /** The doctor's name (shown as text). */
  name: string;
  /** The conventional combination thrown in Frame 1. */
  therapy: DrugId | null;
  /** Configured scores (never calculated here). */
  frame1Score: number | null;
  frame2Score: number;
  onContinue: () => void;
}

/** The final scorecard: Frame 1 (conventional) and Frame 2 (MIQNAF®), with their configured scores. */
export function Scorecard({ open, name, therapy, frame1Score, frame2Score, onContinue }: ScorecardProps) {
  const reduce = useReducedMotion();
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) button.current?.focus();
  }, [open]);

  const cell = "border-t border-line px-3 py-3 align-middle sm:px-5 kiosk:py-[clamp(0.7rem,1.8vh,1.1rem)]";
  const head = "px-3 pb-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-ink-soft sm:px-5 sm:text-sm kiosk:text-base";
  const score = "font-display text-2xl font-black text-brand-navy sm:text-3xl kiosk:text-[clamp(1.7rem,3.2vh,2.4rem)]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scorecard-heading"
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-surface text-center shadow-lift kiosk:max-w-[56rem]"
            initial={reduce ? false : { scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="tricolour-rule h-2" aria-hidden />
            <div className="flex flex-col items-center px-4 py-6 sm:px-10 sm:py-8 short:py-3 kiosk:px-[3rem] kiosk:py-[clamp(1.5rem,3.5vh,2.5rem)]">
              <p className="eyebrow font-body kiosk:text-base">Dr. {name}</p>
              <h2
                id="scorecard-heading"
                className="mt-1 text-[1.7rem] font-black uppercase leading-tight tracking-tight text-brand-navy sm:text-4xl short:text-2xl kiosk:text-[clamp(2rem,4.4vh,3rem)]"
              >
                {SCORECARD_COPY.heading}
              </h2>

              <table className="mt-5 w-full border-collapse text-left kiosk:mt-[clamp(1rem,2.4vh,1.75rem)]">
                <thead>
                  <tr>
                    <th className={head}>Therapy</th>
                    <th className={`${head} text-right`}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={cell}>
                      <span className="block font-display text-lg font-bold text-brand-navy sm:text-xl kiosk:text-[1.4rem]">{SCORECARD_COPY.frame1Therapy}</span>
                      {therapy && <span className="block text-sm text-ink-muted kiosk:text-base">{DRUGS[therapy].name}</span>}
                    </td>
                    <td className={`${cell} text-right`}>
                      <span className={score}>{frame1Score === null ? "–" : `${frame1Score}/${SCORE_OUT_OF}`}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className={cell}>
                      <span className="block font-display text-lg font-bold text-brand-navy sm:text-xl kiosk:text-[1.4rem]">{SCORECARD_COPY.frame2Therapy}</span>
                    </td>
                    <td className={`${cell} text-right`}>
                      <span className={score}>
                        {frame2Score}/{SCORE_OUT_OF}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Only approved, supplied content; hidden until it is configured. */}
              {WHY_MIQNAF && (
                <div className="mt-5 w-full text-left">
                  <h3 className="eyebrow font-body kiosk:text-base">{WHY_MIQNAF.heading}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-ink kiosk:text-[1.1rem]">
                    {WHY_MIQNAF.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <BrandLogo logo="productLogo" className="mt-5 h-10 sm:h-16 short:mt-2 short:h-7 kiosk:mt-[clamp(1rem,2.4vh,1.75rem)] kiosk:h-[clamp(3.5rem,7vh,6rem)]" />

              <div className="sticky bottom-0 z-10 -mb-2 mt-5 flex w-full justify-center bg-surface pb-2 short:mt-2 kiosk:mt-[clamp(1rem,2.4vh,1.75rem)]">
                <button
                  ref={button}
                  type="button"
                  onClick={onContinue}
                  className="btn-primary px-8 py-3.5 text-lg tracking-[0.06em] sm:px-10 sm:text-2xl short:py-2 short:text-lg kiosk:px-[3rem] kiosk:py-[clamp(0.9rem,2vh,1.3rem)] kiosk:text-[clamp(1.4rem,2.6vh,1.9rem)]"
                >
                  {SCORECARD_COPY.button} <ArrowRight className="h-7 w-7" strokeWidth={3} aria-hidden />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

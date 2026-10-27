"use client";

import { AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { DRUGS, SCORE_OUT_OF, SCORECARD_COPY, WHY_MIQNAF } from "@/data/gameData";
import type { DrugId } from "@/types/game";
import { BrandLogo } from "./BrandLogo";
import { GamePanel } from "./GamePanel";

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
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) button.current?.focus();
  }, [open]);

  const cell = "border-t border-white/15 px-3 py-3 align-middle sm:px-5 kiosk:py-[clamp(0.7rem,1.8vh,1.1rem)]";
  const head = "px-3 pb-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-white/60 sm:px-5 sm:text-sm kiosk:text-base";
  const score = "font-display text-3xl font-black text-white sm:text-4xl kiosk:text-[clamp(2rem,3.8vh,2.8rem)]";

  return (
    <AnimatePresence>
      {open && (
        <GamePanel
          titleId="scorecard-heading"
          title={SCORECARD_COPY.heading}
          wide
          actions={
            <button
              ref={button}
              type="button"
              onClick={onContinue}
              className="btn-primary px-10 py-3.5 text-lg tracking-[0.06em] sm:px-12 sm:text-2xl short:py-2 short:text-lg kiosk:px-[3.25rem] kiosk:py-[clamp(0.9rem,2vh,1.3rem)] kiosk:text-[clamp(1.4rem,2.6vh,1.9rem)]"
            >
              {SCORECARD_COPY.button} <ArrowRight className="h-7 w-7" strokeWidth={3} aria-hidden />
            </button>
          }
        >
          <span className="game-panel-logo">
            <BrandLogo logo="productLogo" className="h-8 sm:h-10 short:h-6 kiosk:h-[clamp(2.2rem,4.4vh,3rem)]" />
          </span>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70 short:mt-1.5 kiosk:text-base">Dr. {name}</p>

          <table className="mt-4 w-full border-collapse text-left short:mt-2 kiosk:mt-[clamp(0.9rem,2.2vh,1.5rem)]">
            <thead>
              <tr>
                <th className={head}>Therapy</th>
                <th className={`${head} text-right`}>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cell}>
                  <span className="block font-display text-lg font-bold text-white sm:text-xl kiosk:text-[1.4rem]">{SCORECARD_COPY.frame1Therapy}</span>
                  {therapy && <span className="block text-sm text-white/65 kiosk:text-base">{DRUGS[therapy].name}</span>}
                </td>
                <td className={`${cell} text-right`}>
                  <span className={score}>{frame1Score === null ? "–" : `${frame1Score}/${SCORE_OUT_OF}`}</span>
                </td>
              </tr>
              <tr>
                <td className={cell}>
                  <span className="block font-display text-lg font-bold text-white sm:text-xl kiosk:text-[1.4rem]">{SCORECARD_COPY.frame2Therapy}</span>
                </td>
                <td className={`${cell} text-right`}>
                  <span className={`${score} text-brand-gold`}>
                    {frame2Score}/{SCORE_OUT_OF}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Supplied content only; hidden if it is not configured. */}
          {WHY_MIQNAF && (
            <section aria-labelledby="why-miqnaf" className="mt-4 w-full border-t border-white/15 pt-4 short:mt-2 short:pt-2 kiosk:mt-[clamp(0.9rem,2.2vh,1.4rem)]">
              <h3 id="why-miqnaf" className="font-display text-lg font-black uppercase text-brand-gold sm:text-xl kiosk:text-[clamp(1.2rem,2.4vh,1.6rem)]">
                {WHY_MIQNAF.heading}
              </h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-3 short:mt-1.5 short:gap-2 kiosk:mt-[clamp(0.7rem,1.6vh,1rem)] kiosk:gap-[1rem]">
                {WHY_MIQNAF.points.map((p) => (
                  <li
                    key={p.title}
                    className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/15 short:py-2 kiosk:px-[1rem] kiosk:py-[clamp(0.8rem,2vh,1.25rem)]"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold kiosk:text-[0.95rem]">{p.title}</span>
                    {p.text.map((line) => (
                      <span key={line} className="mt-1 text-base font-semibold leading-snug kiosk:text-[clamp(1rem,1.9vh,1.2rem)]">
                        {line}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </GamePanel>
      )}
    </AnimatePresence>
  );
}

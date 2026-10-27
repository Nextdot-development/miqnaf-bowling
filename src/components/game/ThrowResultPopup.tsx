"use client";

import { AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { DRUGS, PINS, SCORE_OUT_OF } from "@/data/gameData";
import { richToPlain } from "@/lib/gameLogic";
import type { PinNumber, RollResult } from "@/types/game";
import { BrandLogo } from "./BrandLogo";
import { Confetti } from "./Confetti";
import { GamePanel } from "./GamePanel";

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
  /** "strike": all pins down; "attempt": pins left. */
  tone: "attempt" | "strike";
  onAction: () => void;
}

/**
 * After a throw, as an arcade panel: the heading in the header band, then the
 * therapy, the configured score (big), the pins still standing, the message
 * and question; the button sits below the panel. Pin states come from the
 * configured outcome matrix; the score is configured, never calculated.
 */
export function ThrowResultPopup({ result, score, copy, tone, onAction }: ThrowResultPopupProps) {
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
        <GamePanel
          titleId={headingId}
          title={copy.heading}
          overlay={strike ? <Confetti /> : undefined}
          actions={
            <button
              ref={button}
              type="button"
              onClick={onAction}
              className="btn-primary btn-blink px-10 py-3.5 text-lg tracking-[0.06em] sm:px-12 sm:text-2xl short:py-2 short:text-lg kiosk:px-[3.25rem] kiosk:py-[clamp(0.9rem,2vh,1.2rem)] kiosk:text-[clamp(1.3rem,2.5vh,1.8rem)]"
            >
              {copy.button} <ArrowRight className="h-7 w-7" strokeWidth={3} aria-hidden />
            </button>
          }
        >
          <span className="game-panel-logo">
            <BrandLogo logo="productLogo" className="h-8 sm:h-10 short:h-6 kiosk:h-[clamp(2.2rem,4.4vh,3rem)]" />
          </span>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70 short:mt-1.5 kiosk:text-base">{DRUGS[result.drug].name}</p>

          {score !== null && (
            <div className="mt-2 short:mt-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 kiosk:text-sm">Score</p>
              <p className="font-display font-black leading-none text-white" style={{ textShadow: "0 4px 0 rgb(0 0 0 / 0.4)" }}>
                <span className="text-6xl sm:text-7xl short:text-5xl kiosk:text-[clamp(4rem,9vh,6rem)]">{score}</span>
                <span className="text-2xl text-brand-gold kiosk:text-[clamp(1.6rem,3.4vh,2.3rem)]">/{SCORE_OUT_OF}</span>
              </p>
            </div>
          )}
          {strike &&
            copy.lines.map((line) => (
              <p key={line} className="mt-2 font-display text-xl font-black uppercase text-brand-gold sm:text-2xl kiosk:text-[clamp(1.3rem,2.6vh,1.8rem)]">
                {line}
              </p>
            ))}

          {!strike && standing.length > 0 && (
            <>
              <div className="game-panel-rule mt-5 short:mt-2 kiosk:mt-[clamp(1rem,2.4vh,1.5rem)]" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/60 short:mt-2 kiosk:text-sm">
                Still standing · {standing.length} of {result.totalPins}
              </p>
              <ul aria-label="Still standing" className="mt-3 flex flex-wrap justify-center gap-2 short:mt-1.5 kiosk:mt-[0.8rem] kiosk:gap-[0.55rem]">
                {standing.map((p) => (
                  <li
                    key={p.number}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm font-semibold text-white ring-1 ring-white/15 kiosk:text-[1rem]"
                  >
                    <span className="pin-chip-num shrink-0 !bg-brand-gold !text-brand-navy">{p.number}</span>
                    {richToPlain(p.name)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {!strike && (
            <>
              <div className="game-panel-rule mt-5 short:mt-2 kiosk:mt-[clamp(1rem,2.4vh,1.5rem)]" />
              <div className="mt-4 short:mt-2">
                {copy.lines.map((line) => (
                  <p key={line} className="text-base text-white/75 sm:text-lg kiosk:text-[clamp(1.05rem,2vh,1.25rem)]">
                    {line}
                  </p>
                ))}
                {copy.highlight && (
                  <p className="mt-2 font-display text-2xl font-black text-white sm:text-3xl short:text-xl kiosk:text-[clamp(1.6rem,3.4vh,2.3rem)]">
                    {copy.highlight}
                  </p>
                )}
              </div>
            </>
          )}
        </GamePanel>
      )}
    </AnimatePresence>
  );
}

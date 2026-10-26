"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Home, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPin, hasDistinctLabel, TOTAL_PINS } from "@/lib/gameLogic";
import type { PinNumber, RichText as RichTextValue } from "@/types/game";
import { RichText } from "@/components/ui/RichText";
import { BrandLogo } from "./BrandLogo";
import { Confetti } from "./Confetti";

/**
 * won:   nafithromycin knocked every pin down.
 * round: round 1 left pins up; explain why, then on to round 2.
 * lost:  round 2 still left pins up.
 */
export type EndOutcome = "won" | "round" | "lost";

interface EndScreenProps {
  /** null hides the pop-up. */
  outcome: EndOutcome | null;
  /** Scenario line for this result (client wording). */
  message?: string;
  /** Extra line under the message (the first-throw strike tagline). */
  tagline?: string;
  /** Supporting evidence paragraph, shown in a scrollable box. */
  evidence?: RichTextValue | null;
  /** Pins down in total. */
  pinsDown?: number;
  /** Pins left standing. */
  standing?: readonly PinNumber[];
  /** Standing pins the ball only half-knocked (they rocked but stayed up). */
  wobbled?: readonly PinNumber[];
  /** Back to the start screen for the next player. */
  onRestart: () => void;
  /** Round 1 → round 2. */
  onNextRound: () => void;
}

/** With nobody tapping, the final pop-ups return to the start screen after this long. */
const AUTO_RESTART_SECONDS = 30;

const COPY = {
  won: { heading: "You have won the game", line: null, action: "Back to start", Icon: Home },
  round: { heading: null, line: null, action: "Choose another ball", Icon: ArrowRight },
  lost: { heading: "Unfortunately pins are still up", line: "Thanks for attempting", action: "Try again", Icon: RotateCcw },
} as const;

export function EndScreen({
  outcome,
  message,
  tagline,
  evidence,
  pinsDown = 0,
  standing = [],
  wobbled = [],
  onRestart,
  onNextRound,
}: EndScreenProps) {
  const reduce = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const Icon = outcome ? COPY[outcome].Icon : null;
  const final = outcome === "won" || outcome === "lost";
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESTART_SECONDS);

  // Reset while hidden (or between rounds), so each final pop-up starts the full countdown.
  useEffect(() => {
    if (!final) setSecondsLeft(AUTO_RESTART_SECONDS);
  }, [final]);
  useEffect(() => {
    if (!final) return;
    if (secondsLeft <= 0) {
      onRestart();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [final, secondsLeft, onRestart]);

  useEffect(() => {
    if (!outcome) return;
    buttonRef.current?.focus();
    const keepFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", keepFocus);
    return () => document.removeEventListener("keydown", keepFocus);
  }, [outcome]);

  const space = "mt-4 sm:mt-5 kiosk:mt-[clamp(0.9rem,2.2vh,1.75rem)]";

  const body = outcome && (
    <div className="flex flex-col items-center px-5 py-6 sm:px-12 sm:py-8 kiosk:px-[3.5rem] kiosk:py-[clamp(1.5rem,3.5vh,2.75rem)]">
      {outcome === "round" ? (
        <>
          <p className="eyebrow font-body kiosk:text-base">Round 1 · {pinsDown} of {TOTAL_PINS} pins down</p>
          <h2
            id="end-heading"
            className="mt-2 max-w-[44rem] text-balance font-body text-[1.35rem] font-bold leading-tight text-brand-navy sm:text-3xl kiosk:text-[clamp(1.7rem,3.4vh,2.3rem)]"
          >
            {message}
          </h2>
        </>
      ) : (
        <>
          {outcome === "won" ? (
            // The win heading: same style as the try-again heading, in navy.
            <h2
              id="end-heading"
              className="text-[1.6rem] font-black uppercase leading-[1.02] tracking-tight text-brand-navy sm:text-5xl kiosk:text-[clamp(2.2rem,5.4vh,3.6rem)]"
            >
              {COPY[outcome].heading}
            </h2>
          ) : (
            <h2
              id="end-heading"
              className="text-[1.6rem] font-black uppercase leading-[1.02] tracking-tight text-brand-red sm:text-5xl kiosk:text-[clamp(2.2rem,5.4vh,3.6rem)]"
            >
              {COPY[outcome].heading}
            </h2>
          )}
          {message && (
            <p className="mt-3 max-w-[44rem] text-balance text-lg font-bold leading-snug text-brand-navy sm:text-2xl kiosk:text-[clamp(1.35rem,2.6vh,1.8rem)]">
              {message}
            </p>
          )}
          {tagline && (
            <p className="mt-1 text-base font-semibold text-brand-red sm:text-xl kiosk:text-[clamp(1.15rem,2.2vh,1.5rem)]">{tagline}</p>
          )}
        </>
      )}

      {outcome !== "won" && standing.length > 0 && (
        <div className={`w-full ${space}`}>
          <p className="eyebrow font-body kiosk:text-base">
            Still standing · {standing.length} of {TOTAL_PINS} pins
          </p>
          <ul className="mx-auto mt-2 grid max-w-[48rem] gap-1.5 sm:mt-3 sm:grid-cols-2 sm:gap-2 kiosk:gap-[0.55rem]">
            {standing.map((n) => {
              const pin = getPin(n);
              return (
                <li
                  key={n}
                  className="flex items-center gap-2.5 rounded-xl bg-surface-sunken px-3 py-1 text-left leading-tight sm:py-2 kiosk:px-[0.9rem] kiosk:py-[clamp(0.35rem,0.9vh,0.6rem)]"
                >
                  <span className="pin-chip-num shrink-0 kiosk:h-[1.8rem] kiosk:min-w-[1.8rem] kiosk:text-[0.95rem]">{n}</span>
                  <span className="text-[0.82rem] text-ink-muted sm:text-base kiosk:text-[1.02rem]">
                    {hasDistinctLabel(pin) ? (
                      <>
                        <span className="font-bold text-brand-navy">{pin.label}</span>
                        {": "}
                        <RichText value={pin.name} />
                      </>
                    ) : (
                      // Tag and wording are the same (Monotherapy): show it once, bold like the other tags.
                      <span className="font-bold text-brand-navy">
                        <RichText value={pin.name} />
                      </span>
                    )}
                  </span>
                  {wobbled.includes(n) && (
                    <span className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-brand-gold/25 px-2 py-0.5 text-xs font-bold text-brand-navy kiosk:text-sm">
                      50% down
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {evidence && (
        <div
          // No height cap: the whole paragraph is always visible (no inner scrollbar).
          className={`w-full rounded-2xl bg-surface-sunken px-4 py-3 text-left text-[0.85rem] leading-relaxed text-ink sm:px-5 sm:py-4 sm:text-base kiosk:px-[1.4rem] kiosk:py-[clamp(0.75rem,1.6vh,1.1rem)] kiosk:text-[clamp(0.9rem,1.75vh,1.02rem)] kiosk:leading-[1.55] ${space}`}
          aria-label="Evidence"
        >
          <RichText value={evidence} />
        </div>
      )}

      {final && (
        <>
          <BrandLogo logo="productLogo" className={`h-11 sm:h-20 kiosk:h-[clamp(4rem,8vh,7rem)] ${space}`} />
          {COPY[outcome].line && (
            <p className="mt-2 text-lg font-semibold text-ink-muted sm:text-2xl kiosk:text-[clamp(1.3rem,2.4vh,1.8rem)]">
              {COPY[outcome].line}
            </p>
          )}
        </>
      )}

      {/* Stays in view if a very short screen makes the pop-up scroll. */}
      <div className={`sticky bottom-0 z-10 -mb-2 flex w-full flex-col items-center bg-surface pb-2 ${space}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={outcome === "round" ? onNextRound : onRestart}
          className={`btn-primary px-8 py-3.5 text-lg tracking-[0.06em] sm:px-10 sm:py-4 sm:text-2xl kiosk:px-[3rem] kiosk:py-[clamp(0.9rem,2vh,1.3rem)] kiosk:text-[clamp(1.4rem,2.6vh,1.9rem)] ${
            outcome === "won" ? "" : "btn-blink"
          }`}
        >
          {outcome !== "round" && Icon && <Icon className="h-7 w-7 kiosk:h-[2rem] kiosk:w-[2rem]" strokeWidth={3} aria-hidden />}
          {COPY[outcome].action}
          {outcome === "round" && Icon && <Icon className="h-7 w-7 kiosk:h-[2rem] kiosk:w-[2rem]" strokeWidth={3} aria-hidden />}
        </button>
        {final && (
          <p className="mt-3 text-sm font-semibold text-ink-soft kiosk:text-base" aria-live="off">
            Back to the start screen in {Math.max(0, secondsLeft)}s
          </p>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {outcome && (
        <motion.div
          key={outcome}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // The between-rounds pop-up closes at once, so round 2 is ready straight away.
          exit={outcome === "round" ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" aria-hidden />
          {outcome === "won" && <Confetti />}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-heading"
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-surface text-center shadow-lift kiosk:max-w-[60rem]"
            initial={reduce ? false : { scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={outcome === "round" ? undefined : reduce ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="tricolour-rule h-2" aria-hidden />
            {body}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
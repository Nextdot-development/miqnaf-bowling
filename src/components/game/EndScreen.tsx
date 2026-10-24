"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Home, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPin, TOTAL_PINS } from "@/lib/gameLogic";
import type { PinNumber } from "@/types/game";
import { RichText } from "@/components/ui/RichText";
import { BrandLogo } from "./BrandLogo";
import { Confetti } from "./Confetti";

interface EndScreenProps {
  /** null hides the pop-up. */
  outcome: "won" | "lost" | null;
  /** Pins left standing (listed on the "pins are still up" pop-up). */
  standing?: readonly PinNumber[];
  /** Back to the start screen for the next player (one ball per player). */
  onRestart: () => void;
}


const AUTO_RESTART_SECONDS = 20;

const COPY = {
  won: { heading: "You have won the game", line: "Thank you for playing", action: "Back to start", Icon: Home },
  lost: { heading: "Unfortunately pins are still up", line: "Thanks for attempting", action: "Try again", Icon: RotateCcw },
} as const;

export function EndScreen({ outcome, standing = [], onRestart }: EndScreenProps) {
  const reduce = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const Icon = outcome ? COPY[outcome].Icon : null;
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESTART_SECONDS);

  // Reset while hidden, so the next pop-up starts the full countdown.
  useEffect(() => {
    if (!outcome) setSecondsLeft(AUTO_RESTART_SECONDS);
  }, [outcome]);
  useEffect(() => {
    if (!outcome) return;
    if (secondsLeft <= 0) {
      onRestart();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [outcome, secondsLeft, onRestart]);

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

  return (
    <AnimatePresence>
      {outcome && (
        <motion.div
          key={outcome}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" aria-hidden />
          {outcome === "won" && <Confetti />}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-heading"
            className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-surface text-center shadow-lift kiosk:max-w-[56rem]"
            initial={reduce ? false : { scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="tricolour-rule h-2" aria-hidden />
            <div className="flex flex-col items-center px-6 py-10 sm:px-12 kiosk:px-[4rem] kiosk:py-[3.5rem]">
              <h2
                id="end-heading"
                className={`font-black uppercase leading-[1.02] tracking-tight text-[2rem] sm:text-5xl kiosk:text-[3.6rem] ${
                  outcome === "won" ? "text-brand-navy" : "text-brand-red"
                }`}
              >
                {COPY[outcome].heading}
              </h2>
              {outcome === "lost" && standing.length > 0 && (
                <div className="mt-6 w-full kiosk:mt-[2rem]">
                  <p className="eyebrow font-body kiosk:text-base">
                    Still standing · {standing.length} of {TOTAL_PINS} pins
                  </p>
                  <ul className="mt-3 flex flex-wrap justify-center gap-2.5 kiosk:gap-[0.75rem]">
                    {standing.map((n) => {
                      const pin = getPin(n);
                      return (
                        <li
                          key={n}
                          className="flex items-center gap-2.5 rounded-xl bg-surface-sunken px-3 py-2 text-left leading-tight kiosk:px-[1rem] kiosk:py-[0.65rem]"
                        >
                          <span className="pin-chip-num shrink-0 kiosk:h-[1.9rem] kiosk:min-w-[1.9rem] kiosk:text-base">{n}</span>
                          <span className="text-sm text-ink-muted sm:text-base kiosk:text-[1.15rem]">
                            <span className="font-bold text-brand-navy">{pin.label}</span>
                            {": "}
                            <RichText value={pin.organism} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <BrandLogo logo="productLogo" className="mt-8 h-20 sm:h-28 kiosk:mt-[2.75rem] kiosk:h-[9rem]" />
              <p className="mt-8 text-2xl font-semibold text-ink-muted sm:text-3xl kiosk:mt-[2.75rem] kiosk:text-[2.2rem]">
                {COPY[outcome].line}
              </p>
              <button
                ref={buttonRef}
                type="button"
                onClick={onRestart}
                className={`btn-primary mt-8 px-10 py-5 text-2xl tracking-[0.06em] sm:text-3xl kiosk:mt-[2.75rem] kiosk:px-[3.5rem] kiosk:py-[1.5rem] kiosk:text-[2.2rem] ${
                  outcome === "lost" ? "btn-blink" : ""
                }`}
              >
                {Icon && <Icon className="h-8 w-8 kiosk:h-[2.2rem] kiosk:w-[2.2rem]" strokeWidth={3} aria-hidden />}
                {COPY[outcome].action}
              </button>
              <p className="mt-4 text-sm font-semibold text-ink-soft kiosk:text-base" aria-live="off">
                Back to the start screen in {Math.max(0, secondsLeft)}s
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

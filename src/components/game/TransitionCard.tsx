"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { NOVEL_COPY, SCORE_OUT_OF, TRANSITION_COPY } from "@/data/gameData";
import { emitGameSound } from "@/lib/uiSound";

interface TransitionCardProps {
  /** The configured Frame 1 score for the chosen therapy. */
  score: number | null;
  onContinue: () => void;
  className?: string;
}

export function TransitionCard({ score, onContinue, className = "" }: TransitionCardProps) {
  const reduce = useReducedMotion();
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    button.current?.focus();
    emitGameSound("popup");
  }, []);

  return (
    <motion.section
      aria-labelledby="transition-heading"
      className={`flex flex-col items-center ${className}`}
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="game-panel w-full">
        {/* Title band, as on the other game pop-ups. */}
        <div className="game-panel-head !py-2.5 kiosk:!py-[clamp(0.6rem,1.5vh,0.9rem)]">
          <h2 id="transition-heading" className="game-stamp game-panel-title !text-3xl sm:!text-4xl kiosk:!text-[clamp(2rem,4.2vh,2.9rem)]">
            {TRANSITION_COPY.heading}
          </h2>
        </div>

        <div className="px-5 py-4 sm:px-7 kiosk:px-[2rem] kiosk:py-[clamp(0.9rem,2.2vh,1.4rem)]">
          {/* The Frame 1 score beside the message. */}
          <div className="flex items-center gap-4 kiosk:gap-[1.5rem]">
            {score !== null && (
              <div
                className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-black/30 px-5 py-2.5 ring-2 ring-brand-gold kiosk:px-[1.5rem] kiosk:py-[clamp(0.6rem,1.4vh,0.9rem)]"
                aria-label={`Score ${score} out of ${SCORE_OUT_OF}`}
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 kiosk:text-[0.8rem]" aria-hidden>
                  Score
                </span>
                <span className="font-display text-4xl font-black leading-none text-brand-gold kiosk:text-[clamp(2.2rem,4.4vh,3rem)]" aria-hidden>
                  {score}
                  <span className="text-lg text-white/60 kiosk:text-[1.2rem]">/{SCORE_OUT_OF}</span>
                </span>
              </div>
            )}
            <p className="min-w-0 text-left text-base font-semibold leading-snug text-white sm:text-lg kiosk:text-[clamp(1.1rem,2.1vh,1.35rem)]">{TRANSITION_COPY.body}</p>
          </div>

          {/* What happens next: a fresh rack and the novel therapy. */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-gold/10 px-4 py-2.5 text-left ring-1 ring-brand-gold/35 kiosk:mt-[clamp(0.8rem,1.8vh,1.1rem)] kiosk:px-[1.1rem] kiosk:py-[clamp(0.55rem,1.3vh,0.8rem)]">
            <p className="text-sm leading-snug text-white/80 sm:text-base kiosk:text-[clamp(1rem,1.9vh,1.2rem)]">
              {TRANSITION_COPY.rack} <span className="font-semibold text-brand-gold">{TRANSITION_COPY.next}</span>
            </p>
          </div>
        </div>
      </div>

      {/* The one action, below the panel. */}
      <button
        ref={button}
        type="button"
        onClick={onContinue}
        className="btn-primary mt-4 w-full justify-center whitespace-nowrap px-8 py-3.5 text-lg tracking-[0.06em] sm:w-auto sm:text-xl kiosk:mt-[clamp(0.8rem,1.8vh,1.1rem)] kiosk:px-[2.5rem] kiosk:py-[clamp(0.85rem,1.9vh,1.15rem)] kiosk:text-[clamp(1.2rem,2.3vh,1.55rem)]"
      >
        {NOVEL_COPY.heading} <ArrowRight className="h-6 w-6" strokeWidth={3} aria-hidden />
      </button>
    </motion.section>
  );
}

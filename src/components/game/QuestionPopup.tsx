"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { PINS } from "@/data/gameData";
import { RichText } from "@/components/ui/RichText";

interface QuestionPopupProps {
  open: boolean;
  question: string;
  onClose: () => void;
}

/**
 * The question asked as the lane opens, before the player picks a ball.
 * Styled like the end pop-ups (centred card, tricolour rule) with the
 * question set in the readable body face rather than the heavy display face.
 * Closes on the button, Escape or a tap outside; it closes instantly so the
 * lane is usable straight away.
 */
export function QuestionPopup({ open, question, onClose }: QuestionPopupProps) {
  const reduce = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    buttonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab") {
        e.preventDefault(); // one control: keep focus on it
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
    >
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-heading"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-surface text-center shadow-lift kiosk:max-w-[58rem]"
        initial={reduce ? false : { scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 24 }}
      >
        <div className="tricolour-rule h-2" aria-hidden />
        <div className="flex flex-col items-center px-5 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-9 kiosk:px-[3rem] kiosk:pb-[clamp(1.75rem,3.5vh,2.5rem)] kiosk:pt-[clamp(2rem,4vh,2.75rem)]">
          <h2
            id="question-heading"
            className="max-w-[40rem] text-balance font-body text-[1.2rem] font-bold leading-tight text-brand-navy sm:text-[1.75rem] kiosk:max-w-[44rem] kiosk:text-[2rem]"
          >
            {question}
          </h2>
          <div className="mt-4 w-full border-t border-line pt-3.5 sm:mt-6 sm:pt-5 kiosk:mt-[clamp(1.25rem,2.6vh,1.75rem)] kiosk:pt-[clamp(1rem,2.2vh,1.5rem)]">
            <h3 className="eyebrow font-body kiosk:text-base">Your pins</h3>
            <ol className="mt-2 grid gap-1.5 text-left sm:mt-3 sm:gap-2 sm:auto-rows-fr sm:grid-cols-2 kiosk:mt-[0.9rem] kiosk:gap-[0.6rem]">
              {PINS.map((p) => (
                <li
                  key={p.number}
                  className="flex items-center gap-3 rounded-xl bg-surface-sunken px-3 py-1.5 leading-snug sm:px-3.5 sm:py-2.5 kiosk:px-[1rem] kiosk:py-[clamp(0.5rem,1.2vh,0.75rem)]"
                >
                  <span className="pin-chip-num shrink-0 kiosk:h-[1.85rem] kiosk:min-w-[1.85rem] kiosk:text-[0.95rem]" aria-hidden>
                    {p.number}
                  </span>
                  <span className="text-[0.85rem] font-medium text-ink sm:text-base kiosk:text-[1.15rem]">
                    <RichText value={p.name} />
                  </span>
                </li>
              ))}
            </ol>
          </div>
          {/* Stays in view if a very short screen makes the pop-up scroll. */}
          <div className="sticky bottom-0 z-10 -mb-2 flex w-full flex-col items-center bg-surface pb-2 mt-5 sm:mt-7 kiosk:mt-[clamp(1.25rem,3vh,2rem)]">
          <button
            ref={buttonRef}
            type="button"
            onClick={onClose}
            className="btn-primary px-8 py-3 text-lg tracking-[0.06em] sm:px-9 sm:py-3.5 sm:text-xl kiosk:px-[2.5rem] kiosk:py-[1rem] kiosk:text-[1.4rem]"
          >
            Choose a ball <ArrowRight className="h-6 w-6" strokeWidth={3} aria-hidden />
          </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

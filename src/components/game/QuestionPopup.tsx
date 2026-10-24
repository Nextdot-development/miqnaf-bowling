"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

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
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-surface text-center shadow-lift kiosk:max-w-[46rem]"
        initial={reduce ? false : { scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 24 }}
      >
        <div className="tricolour-rule h-2" aria-hidden />
        <div className="flex flex-col items-center px-6 pb-9 pt-10 sm:px-12 kiosk:px-[3.5rem] kiosk:pb-[2.75rem] kiosk:pt-[3rem]">
          <h2
            id="question-heading"
            className="font-body text-2xl font-semibold leading-snug text-brand-navy sm:text-3xl kiosk:text-[2.2rem]"
          >
            {question}
          </h2>
          <button
            ref={buttonRef}
            type="button"
            onClick={onClose}
            className="btn-primary mt-8 px-10 py-4 text-xl tracking-[0.06em] sm:text-2xl kiosk:px-[3rem] kiosk:py-[1.25rem] kiosk:text-[1.8rem]"
          >
            Choose a ball <ArrowRight className="h-7 w-7" strokeWidth={3} aria-hidden />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

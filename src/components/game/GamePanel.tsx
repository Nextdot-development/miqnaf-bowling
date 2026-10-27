"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { emitGameSound } from "@/lib/uiSound";

interface GamePanelProps {
  /** id of the title, for the dialog's accessible name. */
  titleId: string;
  /** The title in the header band. */
  title: ReactNode;
  children: ReactNode;
  /** The main button(s), below the panel. */
  actions: ReactNode;
  /** Extra layer behind the panel (e.g. confetti). */
  overlay?: ReactNode;
  /** Panel width on the kiosk layout. */
  wide?: boolean;
}

/**
 * The game's pop-up: an arcade-style dark panel with a bevelled frame and a
 * header band for the title, and the action button below it. Brand navy and
 * gold throughout.
 */
export function GamePanel({ titleId, title, children, actions, overlay, wide = false }: GamePanelProps) {
  const reduce = useReducedMotion();
  useEffect(() => emitGameSound("popup"), []);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
    >
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" aria-hidden />
      {overlay}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[calc(100dvh-2rem)] w-full flex-col items-center overflow-y-auto no-scrollbar ${
          wide ? "max-w-3xl kiosk:max-w-[56rem]" : "max-w-2xl kiosk:max-w-[48rem]"
        }`}
        initial={reduce ? false : { scale: 0.7, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 20 }}
      >
        <div className="game-panel w-full">
          <div className="game-panel-head">
            <h2 id={titleId} className="game-stamp game-panel-title">
              {title}
            </h2>
          </div>
          <div className="flex flex-col items-center px-5 py-5 text-center sm:px-10 sm:py-7 short:py-3 kiosk:px-[2.75rem] kiosk:py-[clamp(1.1rem,2.8vh,2rem)]">
            {children}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-4 short:mt-2 kiosk:mt-[clamp(1rem,2.4vh,1.6rem)]">{actions}</div>
      </motion.div>
    </motion.div>
  );
}

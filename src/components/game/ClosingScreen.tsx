"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { CLOSING_COPY } from "@/data/gameData";
import { BrandLogo } from "./BrandLogo";
import { GamePanel } from "./GamePanel";

interface ClosingScreenProps {
  /** The doctor's name (shown as text). */
  name: string;
  /** Back to the welcome screen for the next doctor. */
  onContinue: () => void;
}

/** The last screen: a personal thank-you in a pop-up over the lane (supplied copy, draft pending approval). */
export function ClosingScreen({ name, onContinue }: ClosingScreenProps) {
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => button.current?.focus(), []);

  const [thanks, ...message] = CLOSING_COPY.lines;

  return (
    <GamePanel
      titleId="closing-heading"
      title={`${CLOSING_COPY.salutation} Dr. ${name},`}
      actions={
        <button
          ref={button}
          type="button"
          onClick={onContinue}
          className="btn-primary px-10 py-3.5 text-xl tracking-[0.06em] sm:text-2xl kiosk:px-[3.25rem] kiosk:py-[clamp(0.9rem,2vh,1.2rem)] kiosk:text-[clamp(1.35rem,2.6vh,1.75rem)]"
        >
          <RotateCcw className="h-7 w-7" strokeWidth={3} aria-hidden /> {CLOSING_COPY.button}
        </button>
      }
    >
      <span className="game-panel-logo">
        <BrandLogo logo="productLogo" className="h-9 sm:h-11 kiosk:h-[clamp(2.6rem,5vh,3.4rem)]" />
      </span>
      <p className="mt-5 font-display text-xl font-black text-white sm:text-2xl kiosk:mt-[clamp(1.1rem,2.6vh,1.6rem)] kiosk:text-[clamp(1.35rem,2.6vh,1.75rem)]">{thanks}</p>
      <div className="game-panel-rule mt-4 kiosk:mt-[clamp(0.9rem,2vh,1.25rem)]" />
      <div className="mt-4 max-w-xl space-y-2 text-base leading-relaxed text-white/80 sm:text-lg kiosk:max-w-[40rem] kiosk:text-[clamp(1.1rem,2.1vh,1.35rem)]">
        {message.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </GamePanel>
  );
}

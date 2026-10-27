"use client";

import { ArrowRight } from "lucide-react";
import { PINS, THERAPY_INTRO } from "@/data/gameData";
import { richToPlain } from "@/lib/gameLogic";
import { GamePanel } from "./GamePanel";

interface TherapyScreenProps {
  /** The doctor's name (shown as text). */
  name: string;
  /** Closes the pop-up: the doctor then chooses a ball on the lane. */
  onStart: () => void;
}

/**
 * Screen 1, after the name: a pop-up over the lane with the greeting, the
 * challenge and the ten barrier pins. The therapy (ball) is chosen on the lane after it.
 */
export function TherapyScreen({ name, onStart }: TherapyScreenProps) {
  return (
    <GamePanel
      titleId="therapy-greeting"
      title={`Hi Dr. ${name},`}
      wide
      actions={
        <button
          type="button"
          onClick={onStart}
          className="btn-primary whitespace-nowrap px-6 py-3.5 text-lg tracking-[0.06em] sm:px-10 sm:text-2xl kiosk:px-[3rem] kiosk:py-[clamp(0.9rem,2vh,1.1rem)] kiosk:text-[1.7rem]"
        >
          Choose your therapy <ArrowRight className="h-7 w-7" strokeWidth={3} aria-hidden />
        </button>
      }
    >
      <div className="space-y-2 text-lg leading-snug text-white/80 sm:text-xl kiosk:text-[clamp(1.15rem,2.3vh,1.4rem)]">
        <p>{THERAPY_INTRO[0]}</p>
        <p className="font-semibold text-white">{THERAPY_INTRO[1]}</p>
      </div>

      <div className="game-panel-rule mt-4 kiosk:mt-[clamp(0.9rem,2.2vh,1.4rem)]" />
      <h3 className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/60 kiosk:mt-[clamp(0.8rem,2vh,1.2rem)] kiosk:text-base">The barriers (pins)</h3>
      <ol className="mt-3 grid w-full gap-1.5 text-left sm:grid-cols-2 sm:gap-x-3 kiosk:mt-[0.7rem] kiosk:gap-y-[0.45rem]">
        {PINS.map((p) => (
          <li
            key={p.number}
            className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-1.5 leading-snug ring-1 ring-white/10 kiosk:px-[0.9rem] kiosk:py-[clamp(0.3rem,0.8vh,0.55rem)]"
          >
            <span className="pin-chip-num shrink-0 !bg-brand-gold !text-brand-navy kiosk:h-[1.7rem] kiosk:min-w-[1.7rem] kiosk:text-[0.9rem]" aria-hidden>
              {p.number}
            </span>
            <span className="text-sm font-medium text-white sm:text-[0.95rem] kiosk:text-[1.05rem]">{richToPlain(p.name)}</span>
          </li>
        ))}
      </ol>
    </GamePanel>
  );
}

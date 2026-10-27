"use client";

import { RotateCcw } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { SoundToggle } from "./SoundToggle";

interface GameHeaderProps {
  title: string;
  /** Which frame: shown as a badge above the title. */
  frame: 1 | 2 | null;
  soundOn: boolean;
  onSoundChange: (on: boolean) => void;
  onNewSession: () => void;
}

export function GameHeader({
  title,
  frame,
  soundOn,
  onSoundChange,
  onNewSession,
}: GameHeaderProps) {
  return (
    <header className="relative bg-surface">
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[auto_1fr_auto] sm:px-8 lg:px-12 lg:py-4">
        <BrandLogo priority className="h-9 sm:h-11 kiosk:h-[3.4rem]" />
        <div className="order-last col-span-2 min-w-0 text-center sm:order-none sm:col-span-1">
          {frame && (
            <p
              className={`mx-auto mb-1 inline-block rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-[0.14em] sm:text-sm kiosk:text-base ${
                frame === 2 ? "bg-brand-gold text-brand-navy" : "bg-brand-navy text-white"
              }`}
            >
              Frame {frame} of 2
            </p>
          )}
          <h1
            className="truncate text-lg font-black uppercase tracking-tight text-brand-navy sm:text-xl lg:text-2xl xl:text-[2rem]"
            aria-live="polite"
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <SoundToggle on={soundOn} onChange={onSoundChange} />
          <button
            type="button"
            onClick={onNewSession}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-4 py-2 font-bold text-brand-navy shadow-[inset_0_-3px_0_rgb(0_0_0/0.16)] transition-transform active:translate-y-px"
            aria-label="New game"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            <span className="hidden lg:inline">New game</span>
          </button>
        </div>
      </div>
      <div className="tricolour-rule h-1" aria-hidden />
    </header>
  );
}

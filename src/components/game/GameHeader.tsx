"use client";

import { ArrowLeft, RotateCcw, Table2 } from "lucide-react";
import { GAME_TITLE } from "@/data/gameData";
import { ProductLogo } from "./ProductLogo";
import { SoundToggle } from "./SoundToggle";

interface GameHeaderProps {
  title: string;
  coverageOpen: boolean;
  coverageDisabled: boolean;
  soundOn: boolean;
  onToggleCoverage: () => void;
  onSoundChange: (on: boolean) => void;
  onNewSession: () => void;
}

export function GameHeader({
  title,
  coverageOpen,
  coverageDisabled,
  soundOn,
  onToggleCoverage,
  onSoundChange,
  onNewSession,
}: GameHeaderProps) {
  return (
    <header className="relative bg-surface">
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[auto_1fr_auto] sm:px-8 lg:px-12 lg:py-4">
        <ProductLogo priority className="h-9 sm:h-11 kiosk:h-[3.4rem]" />
        <div className="order-last col-span-2 min-w-0 text-center sm:order-none sm:col-span-1">
          <p className="hidden truncate text-xs font-bold uppercase tracking-[0.18em] text-ink-soft md:block">
            {GAME_TITLE}
          </p>
          <h1
            className="truncate text-lg font-black uppercase tracking-tight text-brand-navy sm:text-2xl xl:text-[2rem]"
            aria-live="polite"
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleCoverage}
            disabled={coverageDisabled}
            className="btn-outline"
            aria-label={coverageOpen ? "Back to the lane" : "Open the coverage board"}
          >
            {coverageOpen ? <ArrowLeft className="h-5 w-5" aria-hidden /> : <Table2 className="h-5 w-5" aria-hidden />}
            <span className="hidden lg:inline">{coverageOpen ? "Back to the lane" : "Coverage board"}</span>
          </button>
          <SoundToggle on={soundOn} onChange={onSoundChange} />
          <button
            type="button"
            onClick={onNewSession}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-4 py-2 font-bold text-brand-navy shadow-[inset_0_-3px_0_rgb(0_0_0/0.16)] transition-transform active:translate-y-px"
            aria-label="New game"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            <span className="hidden sm:inline">New game</span>
          </button>
        </div>
      </div>
      <div className="tricolour-rule h-1" aria-hidden />
    </header>
  );
}

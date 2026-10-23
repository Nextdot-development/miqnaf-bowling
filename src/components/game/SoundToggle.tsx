"use client";

import { Volume2, VolumeX } from "lucide-react";

interface SoundToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
}

/** Single switch for roll and pin sounds. Off by default. */
export function SoundToggle({ on, onChange }: SoundToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="inline-flex items-center gap-3 rounded-full border border-line bg-surface py-1.5 pl-3 pr-1.5 font-semibold text-brand-navy shadow-sm transition-colors hover:border-brand-navy/40"
    >
      {on ? <Volume2 className="h-5 w-5" aria-hidden /> : <VolumeX className="h-5 w-5 text-ink-soft" aria-hidden />}
      <span className="hidden sm:inline">Sound {on ? "on" : "off"}</span>
      <span className="sr-only sm:hidden">Sound</span>
      <span
        aria-hidden
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          on ? "bg-brand-navy" : "bg-surface-sunken"
        }`}
      >
        <span
          className={`absolute h-5 w-5 rounded-full bg-surface shadow transition-transform ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

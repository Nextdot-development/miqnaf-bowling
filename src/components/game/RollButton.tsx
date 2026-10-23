"use client";

import { ArrowRight } from "lucide-react";

interface RollButtonProps {
  canRoll: boolean;
  rolling: boolean;
  onRoll: () => void;
}

export function RollButton({ canRoll, rolling, onRoll }: RollButtonProps) {
  return (
    <button
      type="button"
      onClick={onRoll}
      disabled={!canRoll || rolling}
      aria-describedby={!canRoll && !rolling ? "roll-hint" : undefined}
      className="btn-primary w-full py-5 text-3xl tracking-[0.12em] sm:py-6 sm:text-4xl"
    >
      {rolling ? (
        "Rolling…"
      ) : (
        <>
          Roll <ArrowRight className="h-8 w-8" strokeWidth={3} aria-hidden />
        </>
      )}
    </button>
  );
}

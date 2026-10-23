"use client";

import { ChevronRight } from "lucide-react";
import { getPin, richToPlain } from "@/lib/gameLogic";
import type { PinNumber } from "@/types/game";
import { RichText } from "@/components/ui/RichText";

interface StandingPinsListProps {
  standing: readonly PinNumber[];
  onOpenPin: (n: PinNumber) => void;
}

export function StandingPinsList({ standing, onOpenPin }: StandingPinsListProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="eyebrow font-body">Standing pins · {standing.length}</h3>
        {standing.length > 0 && <span className="text-sm text-ink-soft">Tap a pin for its card</span>}
      </div>
      {standing.length === 0 ? (
        <p className="mt-2 rounded-xl bg-surface-sunken/70 px-4 py-3 text-lg font-semibold text-brand-navy">
          None. All eight pins fell on this roll.
        </p>
      ) : (
        <ul className="mt-2 space-y-2" role="list">
          {standing.map((n) => {
            const pin = getPin(n);
            return (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => onOpenPin(n)}
                  className="group flex w-full items-center gap-3 rounded-xl bg-surface-sunken/70 px-3 py-2.5 text-left transition-colors hover:bg-surface-sunken sm:px-4"
                  aria-label={`Pin ${n} stood: ${richToPlain(pin.standingReason ?? [])} ${pin.label}, ${richToPlain(pin.organism)}. Open pathogen card.`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy font-display text-base font-black text-white">
                    {n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-snug text-brand-navy">
                      Pin {n} stood: {pin.standingReason && <RichText value={pin.standingReason} />}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {pin.label} · <RichText value={pin.organism} />
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

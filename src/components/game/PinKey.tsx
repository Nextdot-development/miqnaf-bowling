import { ChevronRight } from "lucide-react";
import { PINS } from "@/data/gameData";
import { richToPlain } from "@/lib/gameLogic";
import type { PinNumber } from "@/types/game";
import { RichText } from "@/components/ui/RichText";

interface PinKeyProps {
  /** Open the pin's pathogen card. */
  onOpenPin: (n: PinNumber) => void;
  /** Rows can't be tapped while the ball is rolling. */
  disabled?: boolean;
  className?: string;
}

/**
 * Pin key: each pin's number, short label and full organism name. Each row
 * opens that pin's pathogen card. On the kiosk it sits over the right edge of
 * the lane, opposite the ball rack; on smaller screens it is a card under it.
 */
export function PinKey({ onOpenPin, disabled = false, className = "" }: PinKeyProps) {
  return (
    <section
      aria-labelledby="pin-key-heading"
      className={`rounded-2xl border border-line bg-surface px-4 py-3 shadow-card kiosk:border-0 kiosk:bg-transparent kiosk:p-0 kiosk:shadow-none ${className}`}
    >
      <h2 id="pin-key-heading" className="eyebrow mb-3 hidden text-white/80 kiosk:block kiosk:text-base">
        The pins
      </h2>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 kiosk:grid-cols-1 kiosk:gap-y-[0.55rem]">
        {PINS.map((p) => (
          <li key={p.number}>
            <button
              type="button"
              onClick={() => onOpenPin(p.number)}
              disabled={disabled}
              aria-label={`Pathogen card for pin ${p.number}, ${p.label}: ${richToPlain(p.organism)}`}
              className="group flex w-full items-center gap-2.5 rounded-xl text-left leading-tight transition-colors enabled:hover:bg-surface-sunken disabled:cursor-default kiosk:bg-black/45 kiosk:px-[0.85rem] kiosk:py-[0.55rem] kiosk:ring-1 kiosk:ring-white/15 kiosk:backdrop-blur-sm kiosk:enabled:hover:bg-black/60 kiosk:enabled:active:bg-brand-navy/80"
            >
              <span className="pin-chip-num shrink-0 kiosk:bg-white kiosk:text-brand-navy">{p.number}</span>
              <span className="min-w-0 flex-1 text-sm text-ink-muted kiosk:text-[0.95rem] kiosk:text-white/80">
                <span className="font-bold text-brand-navy kiosk:text-white">{p.label}</span>
                {": "}
                <RichText value={p.organism} />
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-enabled:group-hover:translate-x-0.5 group-disabled:opacity-0 kiosk:h-5 kiosk:w-5 kiosk:text-white/60"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

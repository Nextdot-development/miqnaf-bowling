"use client";

import type { CSSProperties } from "react";
import { DRUG_ORDER, DRUGS } from "@/data/gameData";
import { BALL_COLORS } from "@/lib/drugVisuals";
import { pinsDownCount, TOTAL_PINS } from "@/lib/gameLogic";
import type { DrugId, GamePhase } from "@/types/game";

interface BallRackProps {
  phase: GamePhase;
  selectedDrug: DrugId | null;
  rolledDrugs: readonly DrugId[];
  onSelect: (drug: DrugId) => void;
  className?: string;
}

export function BallRack({ phase, selectedDrug, rolledDrugs, onSelect, className = "" }: BallRackProps) {
  if (phase !== "selecting") return null;

  return (
    <section aria-labelledby="ball-rack-heading" className={className}>
      <h2 id="ball-rack-heading" className="eyebrow mb-3 text-white/80 kiosk:text-base">
        Choose a ball
      </h2>
      <ul className="grid grid-cols-3 gap-2 sm:gap-4 kiosk:grid-cols-1 kiosk:gap-[1.25rem]" role="list">
        {DRUG_ORDER.map((id) => {
          const drug = DRUGS[id];
          const selected = id === selectedDrug;
          const badge = selected
            ? "Selected"
            : rolledDrugs.includes(id)
              ? `Rolled · ${pinsDownCount(id)} of ${TOTAL_PINS}`
              : null;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-pressed={selected}
                aria-label={`${drug.name}, ${drug.drugClass}. ${drug.description}${badge ? ` ${badge}.` : ""}`}
                style={{ "--ball": BALL_COLORS[id] } as CSSProperties}
                className={`relative flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center backdrop-blur-sm transition-colors sm:flex-row sm:gap-4 sm:px-4 sm:text-left kiosk:px-[1.25rem] kiosk:py-[1rem] ${
                  selected ? "bg-brand-navy/90 ring-[3px] ring-brand-gold" : "bg-black/45 ring-1 ring-white/20 hover:bg-black/60"
                }`}
              >
                {badge && (
                  <span
                    className={`absolute -top-3 right-3 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm kiosk:text-sm ${
                      selected ? "bg-brand-gold text-brand-navy" : "bg-surface text-ink-muted"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                <span className="ball-swatch h-12 w-12 sm:h-16 sm:w-16 kiosk:h-[5rem] kiosk:w-[5rem]" aria-hidden />
                <span className="min-w-0 leading-tight">
                  <span className="block font-display text-sm font-bold text-white sm:text-xl kiosk:text-[1.6rem]">{drug.name}</span>
                  <span className="hidden text-sm text-white/75 sm:block kiosk:text-base">{drug.drugClass}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

"use client";

import { DRUG_ORDER, DRUGS } from "@/data/gameData";
import { pinsDownCount, TOTAL_PINS } from "@/lib/gameLogic";
import type { DrugId, GamePhase } from "@/types/game";
import { BallCard, type BallCardBadge } from "./BallCard";

interface BallSelectorProps {
  phase: GamePhase;
  selectedDrug: DrugId | null;
  rolledDrugs: readonly DrugId[];
  onSelect: (drug: DrugId) => void;
}

export function BallSelector({ phase, selectedDrug, rolledDrugs, onSelect }: BallSelectorProps) {
  const rolling = phase === "rolling";

  const badgeFor = (drug: DrugId): BallCardBadge | null => {
    const isSelected = drug === selectedDrug;
    if (isSelected && phase === "result") {
      return { kind: "current", pinsDown: pinsDownCount(drug), total: TOTAL_PINS };
    }
    if (isSelected) return { kind: "selected" };
    // Only balls already rolled this session reveal their count.
    if (rolledDrugs.includes(drug)) return { kind: "previous", pinsDown: pinsDownCount(drug), total: TOTAL_PINS };
    return null;
  };

  return (
    <section aria-labelledby="ball-select-heading">
      <h2 id="ball-select-heading" className="sr-only">
        Choose a ball
      </h2>
      <ul className="grid grid-cols-1 gap-4 pt-3" role="list">
        {DRUG_ORDER.map((id) => (
          <li key={id} className="h-full">
            <BallCard
              drug={DRUGS[id]}
              selected={id === selectedDrug}
              emphasised={id === selectedDrug}
              badge={badgeFor(id)}
              disabled={rolling}
              muted={rolling}
              onSelect={() => onSelect(id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

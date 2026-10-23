"use client";

import { DRUG_ORDER, DRUGS } from "@/data/gameData";
import type { PinNumber, RollResult } from "@/types/game";
import { DiscussionPrompt } from "./DiscussionPrompt";
import { StandingPinsList } from "./StandingPinsList";

interface ResultPanelProps {
  result: RollResult;
  rolledCount: number;
  onOpenPin: (n: PinNumber) => void;
}

export function ResultPanel({ result, rolledCount, onOpenPin }: ResultPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">{DRUGS[result.drug].name}</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <p className="flex items-baseline gap-3 text-brand-navy">
            {/* Brand gold on a navy tile: gold alone is too faint on white. */}
            <span className="inline-flex min-w-[1.35em] items-center justify-center self-center rounded-2xl bg-brand-navy px-3 py-1 font-display text-6xl font-black leading-none text-brand-gold sm:text-7xl">
              {result.pinsDown}
            </span>
            <span className="text-2xl font-semibold sm:text-3xl">of {result.totalPins} pins down</span>
          </p>
          <span className="rounded-full bg-surface-sunken px-3 py-1.5 text-sm font-bold text-brand-navy">
            {rolledCount} of {DRUG_ORDER.length} balls rolled
          </span>
        </div>
      </div>
      <StandingPinsList standing={result.standing} onOpenPin={onOpenPin} />
      <DiscussionPrompt id={result.promptId} />
    </div>
  );
}

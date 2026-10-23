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
            <span className="font-display text-7xl font-black leading-none sm:text-8xl">{result.pinsDown}</span>
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

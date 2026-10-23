"use client";

import { ArrowLeft, Info } from "lucide-react";
import type { CSSProperties } from "react";
import { DRUG_ORDER, DRUGS, PINS } from "@/data/gameData";
import { BALL_COLORS } from "@/lib/drugVisuals";
import { pinsDownCount, pinStatus, revealedStatus, TOTAL_PINS } from "@/lib/gameLogic";
import type { CoverageMode, DrugId, PinNumber, PinStatus, PromptId } from "@/types/game";
import { RichText } from "@/components/ui/RichText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DiscussionPrompt } from "./DiscussionPrompt";

interface CoverageBoardProps {
  mode: CoverageMode;
  rolledDrugs: readonly DrugId[];
  promptId: PromptId | null;
  onModeChange: (mode: CoverageMode) => void;
  onOpenPin: (n: PinNumber) => void;
  onClose: () => void;
}

export function CoverageBoard({ mode, rolledDrugs, promptId, onModeChange, onOpenPin, onClose }: CoverageBoardProps) {
  // Session mode respects reveal rules; reference mode is an explicit opt-in.
  const statusFor = (drug: DrugId, n: PinNumber): PinStatus | "not-rolled" =>
    mode === "reference" ? pinStatus(drug, n) : revealedStatus(drug, n, rolledDrugs);
  const totalShown = (drug: DrugId) => mode === "reference" || rolledDrugs.includes(drug);
  const notRolled = <span className="font-body text-base font-semibold italic text-ink-soft">Not rolled</span>;

  const ballDot = (id: DrugId) => (
    <span
      className="ball-swatch h-5 w-5 ring-2 ring-white/80"
      style={{ "--ball": BALL_COLORS[id] } as CSSProperties}
      aria-hidden
    />
  );

  return (
    <div className="grid gap-5 kiosk:min-h-0 kiosk:flex-1 kiosk:grid-cols-[minmax(0,1fr)_minmax(22rem,30%)] kiosk:gap-[2rem]">
      <section
        aria-labelledby="coverage-title"
        className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card kiosk:min-h-0 kiosk:overflow-y-auto"
      >
        <h2 id="coverage-title" className="sr-only">
          Coverage board
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
          <div role="radiogroup" aria-label="Board view" className="inline-flex rounded-full bg-surface-sunken p-1">
            {(
              [
                ["session", "Your session"],
                ["reference", "Full reference matrix"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => onModeChange(value)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors sm:text-base ${
                  mode === value ? "bg-brand-navy text-white shadow" : "text-brand-navy hover:bg-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Info className="h-4 w-4 shrink-0" aria-hidden />
            {mode === "reference"
              ? "Reference view: the complete supplied matrix, including balls not yet rolled."
              : "Only balls you have rolled this session are shown."}
          </p>
        </div>

        {/* Table on wider screens */}
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Pin outcomes by ball ({mode === "reference" ? "full reference matrix" : "this session"})
            </caption>
            <thead className="bg-brand-navy text-sm uppercase tracking-[0.08em] text-white">
              <tr>
                <th scope="col" className="px-5 py-4 font-bold">Pin</th>
                <th scope="col" className="px-3 py-4 font-bold">Pathogen</th>
                <th scope="col" className="px-3 py-4 font-bold">Label</th>
                {DRUG_ORDER.map((id) => (
                  <th key={id} scope="col" className="px-3 py-4 font-bold">
                    <span className="inline-flex items-center gap-2">
                      {ballDot(id)}
                      {DRUGS[id].name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PINS.map((pin, i) => (
                <tr
                  key={pin.number}
                  className={`cursor-pointer border-b border-line transition-colors hover:bg-surface-tint/60 ${
                    i % 2 ? "bg-surface-page/60" : ""
                  }`}
                  onClick={() => onOpenPin(pin.number)}
                >
                  <td className="px-5 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy font-display font-black text-white">
                      {pin.number}
                    </span>
                  </td>
                  <th scope="row" className="px-3 py-3 font-semibold text-ink">
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPin(pin.number);
                      }}
                    >
                      <RichText value={pin.organism} />
                    </button>
                  </th>
                  <td className="px-3 py-3 font-bold text-brand-navy">{pin.label}</td>
                  {DRUG_ORDER.map((id) => (
                    <td key={id} className="px-3 py-3">
                      <StatusBadge status={statusFor(id, pin.number)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-tint">
                <td />
                <th scope="row" colSpan={2} className="px-3 py-4 text-lg font-bold text-brand-navy">
                  Pins down (out of {TOTAL_PINS})
                </th>
                {DRUG_ORDER.map((id) => (
                  <td key={id} className="px-3 py-4 font-display text-3xl font-black text-brand-navy">
                    {totalShown(id) ? pinsDownCount(id) : notRolled}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Stacked cards on small screens */}
        <ul className="divide-y divide-line md:hidden" role="list">
          {PINS.map((pin) => (
            <li key={pin.number}>
              <button type="button" onClick={() => onOpenPin(pin.number)} className="w-full px-4 py-3 text-left">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy font-display font-black text-white">
                    {pin.number}
                  </span>
                  <span>
                    <span className="block font-bold text-brand-navy">{pin.label}</span>
                    <span className="block text-sm text-ink-muted">
                      <RichText value={pin.organism} />
                    </span>
                  </span>
                </span>
                <span className="mt-2 grid grid-cols-3 gap-2">
                  {DRUG_ORDER.map((id) => (
                    <span key={id} className="rounded-lg bg-surface-sunken/70 px-2 py-1.5">
                      <span className="block text-xs font-bold text-ink-muted">{DRUGS[id].name}</span>
                      <StatusBadge status={statusFor(id, pin.number)} compact />
                    </span>
                  ))}
                </span>
              </button>
            </li>
          ))}
          <li className="grid grid-cols-3 gap-2 bg-surface-tint px-4 py-3">
            {DRUG_ORDER.map((id) => (
              <span key={id}>
                <span className="block text-xs font-bold text-ink-muted">{DRUGS[id].name}</span>
                {totalShown(id) ? (
                  <span className="font-display text-2xl font-black text-brand-navy">
                    {pinsDownCount(id)}
                    <span className="text-sm font-semibold"> / {TOTAL_PINS}</span>
                  </span>
                ) : (
                  notRolled
                )}
              </span>
            ))}
          </li>
        </ul>
      </section>

      <aside className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7 kiosk:min-h-0 kiosk:overflow-y-auto">
        <DiscussionPrompt id={promptId} large />
        <div>
          <h3 className="eyebrow font-body">Key</h3>
          <ul className="mt-3 space-y-2.5 text-lg" role="list">
            <li>
              <StatusBadge status="down" />
              <span className="text-ink">: pin fell on that ball&apos;s roll</span>
            </li>
            <li>
              <StatusBadge status="standing" />
              <span className="text-ink">: pin stayed up</span>
            </li>
            <li>
              <StatusBadge status="not-rolled" />
              <span className="text-ink">: ball not rolled this session</span>
            </li>
          </ul>
          <p className="mt-4 text-ink-muted">Tap any row to open that pin&apos;s pathogen card.</p>
        </div>
        <button type="button" onClick={onClose} className="btn-primary mt-auto w-full py-5 text-2xl normal-case tracking-normal">
          <ArrowLeft className="h-7 w-7" strokeWidth={3} aria-hidden /> Back to the lane
        </button>
      </aside>
    </div>
  );
}

"use client";

import { DRUG_ORDER, DRUGS, PENDING_REVIEW_COPY } from "@/data/gameData";
import { getPin, revealedStatus } from "@/lib/gameLogic";
import type { DrugId, PinNumber } from "@/types/game";
import { Dialog } from "@/components/ui/Dialog";
import { RichText } from "@/components/ui/RichText";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface PathogenInfoDialogProps {
  pinNumber: PinNumber | null;
  rolledDrugs: readonly DrugId[];
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-3">
      <h3 className="eyebrow font-body">{title}</h3>
      <div className="mt-1.5 text-lg leading-relaxed text-ink">{children}</div>
    </section>
  );
}

/**
 * Pathogen card. General organism information and the supplied basis line are
 * always shown; per-drug outcomes only for drugs rolled this session.
 */
export function PathogenInfoDialog({ pinNumber, rolledDrugs, onClose }: PathogenInfoDialogProps) {
  const pin = pinNumber ? getPin(pinNumber) : null;

  return (
    <Dialog
      open={pin !== null}
      onClose={onClose}
      eyebrow={pin ? `Pin ${pin.number} · ${pin.label}` : undefined}
      title={pin ? <RichText value={pin.organism} /> : ""}
      footer={
        <button type="button" onClick={onClose} className="btn-primary w-full py-3.5 text-lg normal-case tracking-normal">
          Back to the game
        </button>
      }
    >
      {pin && (
        <div className="divide-y divide-line">
          <Section title="Why it matters in CABP">
            {pin.whyItMatters ?? (
              <span className="inline-flex items-center gap-2 rounded-lg bg-surface-sunken px-3 py-1.5 text-base font-semibold text-ink-muted">
                {PENDING_REVIEW_COPY}
              </span>
            )}
          </Section>
          {pin.mechanism && (
            <Section title="Resistance mechanism">
              <RichText value={pin.mechanism} />
            </Section>
          )}
          <Section title="Basis">{pin.basis}</Section>
          <section className="py-3">
            <h3 className="eyebrow font-body">Outcome by ball</h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-3" role="list">
              {DRUG_ORDER.map((id) => (
                <li key={id} className="rounded-xl bg-surface-sunken/70 px-3 py-2.5">
                  <span className="block font-bold text-brand-navy">{DRUGS[id].name}</span>
                  <StatusBadge status={revealedStatus(id, pin.number, rolledDrugs)} compact />
                </li>
              ))}
            </ul>
            {rolledDrugs.length < DRUG_ORDER.length && (
              <p className="mt-2 text-sm text-ink-soft">Outcomes appear here once that ball has been rolled.</p>
            )}
          </section>
        </div>
      )}
    </Dialog>
  );
}

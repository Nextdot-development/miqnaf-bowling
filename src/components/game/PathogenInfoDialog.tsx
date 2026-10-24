"use client";

import { PENDING_REVIEW_COPY } from "@/data/gameData";
import { getPin } from "@/lib/gameLogic";
import type { PinNumber } from "@/types/game";
import { Dialog } from "@/components/ui/Dialog";
import { RichText } from "@/components/ui/RichText";

interface PathogenInfoDialogProps {
  pinNumber: PinNumber | null;
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
 * Pathogen card: general organism information and the supplied basis line.
 */
export function PathogenInfoDialog({ pinNumber, onClose }: PathogenInfoDialogProps) {
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
        </div>
      )}
    </Dialog>
  );
}

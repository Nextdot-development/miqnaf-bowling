"use client";

import { getPin } from "@/lib/gameLogic";
import type { PinNumber } from "@/types/game";
import { Dialog } from "@/components/ui/Dialog";
import { RichText } from "@/components/ui/RichText";

interface PathogenInfoDialogProps {
  pinNumber: PinNumber | null;
  onClose: () => void;
}

/** Pin card: the pin's number and full wording. Closes with the ✕, a tap outside it, or Escape. */
export function PathogenInfoDialog({ pinNumber, onClose }: PathogenInfoDialogProps) {
  const pin = pinNumber ? getPin(pinNumber) : null;

  return (
    <Dialog
      open={pin !== null}
      onClose={onClose}
      title={
        pin ? (
          <span className="flex items-center gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy font-display text-xl font-black text-white sm:h-12 sm:w-12 sm:text-2xl"
              aria-label={`Pin ${pin.number}`}
            >
              {pin.number}
            </span>
            <span className="min-w-0">
              <RichText value={pin.name} />
            </span>
          </span>
        ) : (
          ""
        )
      }
    />
  );
}

import { PINS } from "@/data/gameData";
import { richToPlain } from "@/lib/gameLogic";
import type { LanePin, LanePins } from "@/types/game";

interface AccessiblePinListProps {
  lane: LanePins;
  /** Say whether each pin is up or down (after a throw). */
  showOutcome: boolean;
}

const SAID: Record<LanePin, string> = { up: "Standing", down: "Down", wobble: "Wobbled, still standing", cleared: "Down in round 1" };

/** Screen-reader description of the pin deck (the visible pin tags are the controls). */
export function AccessiblePinList({ lane, showOutcome }: AccessiblePinListProps) {
  return (
    <div className="sr-only">
      <h2>Pin deck</h2>
      <p>One lane with eight pins: front row pins 1 to 4, rear row pins 5 to 8.</p>
      <ol>
        {PINS.map((pin) => (
          <li key={pin.number}>
            Pin {pin.number}, {pin.label}: {richToPlain(pin.name)}
            {showOutcome || lane[pin.number] === "cleared" ? `. ${SAID[lane[pin.number]]}.` : "."}
          </li>
        ))}
      </ol>
    </div>
  );
}

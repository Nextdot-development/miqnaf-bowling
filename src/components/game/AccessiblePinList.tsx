import { PINS } from "@/data/gameData";
import { pinStatus, richToPlain } from "@/lib/gameLogic";
import type { DrugId, GamePhase } from "@/types/game";

interface AccessiblePinListProps {
  phase: GamePhase;
  drug: DrugId | null;
}

export function AccessiblePinList({ phase, drug }: AccessiblePinListProps) {
  const showOutcome = phase === "result" && drug !== null;
  return (
    <div className="sr-only">
      <h2>Pin deck</h2>
      <p>One lane with eight pins: front row pins 1 to 4, rear row pins 5 to 8.</p>
      <ol>
        {PINS.map((pin) => (
          <li key={pin.number}>
            Pin {pin.number}, {pin.label}: {richToPlain(pin.organism)}
            {showOutcome ? `. ${pinStatus(drug, pin.number) === "down" ? "Down" : "Standing"}.` : "."}
          </li>
        ))}
      </ol>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { PINS } from "@/data/gameData";
import { pinStatus } from "@/lib/gameLogic";
import { FRONT_ROW_Z, PIN_HEIGHT, pinPosition } from "@/lib/laneLayout";
import { createProjector } from "@/lib/projection";
import { ballArrivalSeconds } from "@/lib/rollAnimation";

/** When the ball reaches the front row, measured from the start of the roll. */
const HIT_SECONDS = ballArrivalSeconds(FRONT_ROW_Z);
import { useElementSize } from "@/hooks/useElementSize";
import type { DrugId, GamePhase, Pin } from "@/types/game";
import { PinLabel } from "./PinLabel";

interface PinLabelsOverlayProps {
  phase: GamePhase;
  outcomeDrug: DrugId | null;
  interactive: boolean;
  pinName: (pin: Pin) => string;
  onPinSelect: (pin: Pin) => void;
}

export function PinLabelsOverlay({ phase, outcomeDrug, interactive, pinName, onPinSelect }: PinLabelsOverlayProps) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const project = useMemo(() => (width && height ? createProjector(width, height) : null), [width, height]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-10">
      {project &&
        PINS.map((pin) => {
          const { x, z } = pinPosition(pin.number);
          // Front-row chips hang below the pin base; rear-row chips sit above the head.
          const front = pin.row === "front";
          const label = front ? project(x, 0, z + 0.12) : project(x, PIN_HEIGHT + 0.03, z);
          const falls = outcomeDrug !== null && pinStatus(outcomeDrug, pin.number) === "down";
          const fallen = phase === "result" && falls;

          const fading = phase === "rolling" && falls;
          return (
            <div key={pin.number}>
              {!fallen && (
                <div
                  className={`absolute -translate-x-1/2 transition-opacity duration-300 ${front ? "" : "-translate-y-full"} ${
                    fading ? "pointer-events-none opacity-0" : "pointer-events-auto"
                  }`}
                  style={{ left: label.x, top: label.y, transitionDelay: fading ? `${HIT_SECONDS}s` : "0s" }}
                >
                  <PinLabel pin={pin} interactive={interactive} accessibleName={pinName(pin)} onSelect={onPinSelect} />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

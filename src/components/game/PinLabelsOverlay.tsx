"use client";

import { useMemo } from "react";
import { PINS } from "@/data/gameData";
import { pinStatus } from "@/lib/gameLogic";
import { PIN_HEIGHT, pinPosition } from "@/lib/laneLayout";
import { createProjector } from "@/lib/projection";
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

/**
 * Pin number/label chips positioned over the lane. The camera is fixed, so a
 * plain DOM overlay using the same projection as the scene stays aligned
 * with both the 3D and 2D renderers, and the chips are ordinary buttons.
 */
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
          const base = project(x, 0, z);
          const fallen = phase === "result" && outcomeDrug !== null && pinStatus(outcomeDrug, pin.number) === "down";
          return (
            <div key={pin.number}>
              {fallen && (
                <span
                  aria-hidden
                  className="pin-spot-number absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: base.x, top: base.y }}
                >
                  {pin.number}
                </span>
              )}
              <div
                className={`pointer-events-auto absolute -translate-x-1/2 ${front ? "" : "-translate-y-full"}`}
                style={{ left: label.x, top: label.y }}
              >
                <PinLabel pin={pin} interactive={interactive} accessibleName={pinName(pin)} onSelect={onPinSelect} />
              </div>
            </div>
          );
        })}
    </div>
  );
}

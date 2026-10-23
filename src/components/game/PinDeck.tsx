"use client";

import { useEffect, useMemo } from "react";
import { PINS } from "@/data/gameData";
import { pinStatus } from "@/lib/gameLogic";
import type { DrugId, GamePhase, Pin } from "@/types/game";
import { PathogenPin } from "./PathogenPin";
import { createPinGeometry, createPinTexture, createSpotTexture } from "./sceneAssets";

interface PinDeckProps {
  phase: GamePhase;
  /** Drug whose outcome the deck is showing (rolling or result), if any. */
  outcomeDrug: DrugId | null;
  interactive: boolean;
  onPinSelect: (pin: Pin) => void;
}

export function PinDeck({ phase, outcomeDrug, interactive, onPinSelect }: PinDeckProps) {
  const geometry = useMemo(() => createPinGeometry(), []);
  const skin = useMemo(() => createPinTexture(), []);
  const spot = useMemo(() => createSpotTexture(), []);

  useEffect(
    () => () => {
      geometry.dispose();
      skin.dispose();
      spot.dispose();
    },
    [geometry, skin, spot],
  );

  const showingOutcome = (phase === "rolling" || phase === "result") && outcomeDrug !== null;

  return (
    <group>
      {PINS.map((pin) => {
        const falls = showingOutcome && pinStatus(outcomeDrug, pin.number) === "down";
        return (
          <PathogenPin
            key={pin.number}
            pin={pin}
            geometry={geometry}
            skin={skin}
            spotTexture={spot}
            falls={falls}
            showSpot={phase === "result" && falls}
            interactive={interactive}
            onSelect={onPinSelect}
          />
        );
      })}
    </group>
  );
}

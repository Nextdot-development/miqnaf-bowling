"use client";

import { useEffect, useMemo } from "react";
import { PINS } from "@/data/gameData";
import { pinStatus } from "@/lib/gameLogic";
import type { DrugId, GamePhase, Pin } from "@/types/game";
import { PathogenPin } from "./PathogenPin";
import { createPinGeometry, createPinTexture } from "./sceneAssets";

interface PinDeckProps {
  phase: GamePhase;
  
  outcomeDrug: DrugId | null;
  interactive: boolean;
  onPinSelect: (pin: Pin) => void;
}

export function PinDeck({ phase, outcomeDrug, interactive, onPinSelect }: PinDeckProps) {
  const geometry = useMemo(() => createPinGeometry(), []);
  const skin = useMemo(() => createPinTexture(), []);

  useEffect(
    () => () => {
      geometry.dispose();
      skin.dispose();
    },
    [geometry, skin],
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
            falls={falls}
            interactive={interactive}
            onSelect={onPinSelect}
          />
        );
      })}
    </group>
  );
}

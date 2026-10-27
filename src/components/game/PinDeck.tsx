"use client";

import { useEffect, useMemo } from "react";
import { PINS } from "@/data/gameData";
import type { LanePins, Pin } from "@/types/game";
import { PathogenPin } from "./PathogenPin";
import { createPinGeometry, createPinTexture } from "./sceneAssets";

interface PinDeckProps {
  /** Every pin's state for this throw. */
  lane: LanePins;
  interactive: boolean;
  onPinSelect: (pin: Pin) => void;
}

export function PinDeck({ lane, interactive, onPinSelect }: PinDeckProps) {
  const geometry = useMemo(() => createPinGeometry(), []);
  const skin = useMemo(() => createPinTexture(), []);

  useEffect(
    () => () => {
      geometry.dispose();
      skin.dispose();
    },
    [geometry, skin],
  );

  return (
    <group>
      {PINS.map((pin) => {
        const status = lane[pin.number];
        return (
          <PathogenPin
            key={pin.number}
            pin={pin}
            geometry={geometry}
            skin={skin}
            status={status}
            interactive={interactive}
            onSelect={onPinSelect}
          />
        );
      })}
    </group>
  );
}

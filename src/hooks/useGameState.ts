"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { gameReducer, initialGameState } from "@/lib/gameReducer";
import { pinsDownCount } from "@/lib/gameLogic";
import { BALL_TRAVEL_MS, ROLL_TOTAL_MS } from "@/lib/timing";
import { useGameAudio } from "@/hooks/useGameAudio";
import type { CoverageMode, DrugId, PinNumber } from "@/types/game";

/**
 * Wires the pure reducer to time and sound. The roll timer lives here (not in
 * the 3D scene) so the outcome never depends on rendering or physics.
 */
export function useGameState(reducedMotion: boolean) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const audio = useGameAudio(state.soundOn);

  const { phase, rollId, rollInstant, selectedDrug } = state;

  useEffect(() => {
    if (phase !== "rolling" || rollInstant) return;
    const done = window.setTimeout(() => dispatch({ type: "ROLL_COMPLETE", rollId }), ROLL_TOTAL_MS);
    return () => window.clearTimeout(done);
  }, [phase, rollId, rollInstant]);

  // Sounds follow the same fixed timeline for every drug.
  const { playRoll, playPins } = audio;
  useEffect(() => {
    if (phase !== "rolling" || rollInstant || !selectedDrug) return;
    playRoll(BALL_TRAVEL_MS);
    const impact = window.setTimeout(() => playPins(pinsDownCount(selectedDrug)), BALL_TRAVEL_MS - 40);
    return () => window.clearTimeout(impact);
  }, [phase, rollId, rollInstant, selectedDrug, playRoll, playPins]);

  const actions = useMemo(
    () => ({
      start: () => dispatch({ type: "START_SESSION" }),
      newSession: () => dispatch({ type: "NEW_SESSION" }),
      selectDrug: (drug: DrugId) => dispatch({ type: "SELECT_DRUG", drug }),
      chooseAnother: () => dispatch({ type: "CHOOSE_ANOTHER" }),
      openCoverage: () => dispatch({ type: "OPEN_COVERAGE" }),
      closeCoverage: () => dispatch({ type: "CLOSE_COVERAGE" }),
      setCoverageMode: (mode: CoverageMode) => dispatch({ type: "SET_COVERAGE_MODE", mode }),
      openPin: (pin: PinNumber) => dispatch({ type: "OPEN_PIN", pin }),
      closePin: () => dispatch({ type: "CLOSE_PIN" }),
    }),
    [],
  );

  const roll = useCallback(() => {
    dispatch({ type: "ROLL", at: performance.now(), instant: reducedMotion });
  }, [reducedMotion]);

  const { unlock } = audio;
  const setSound = useCallback(
    (on: boolean) => {
      if (on) unlock();
      dispatch({ type: "SET_SOUND", on });
    },
    [unlock],
  );

  return { state, ...actions, roll, setSound };
}

export type GameController = ReturnType<typeof useGameState>;

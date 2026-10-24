"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { gameReducer, initialGameState } from "@/lib/gameReducer";
import { pinsDownCount, TOTAL_PINS } from "@/lib/gameLogic";
import { ROLL_TOTAL_MS } from "@/lib/timing";
import { useGameAudio } from "@/hooks/useGameAudio";
import type { DrugId, PinNumber } from "@/types/game";

export function useGameState(reducedMotion: boolean) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const audio = useGameAudio(state.soundOn);

  const { phase, rollId, rollInstant, selectedDrug } = state;

  useEffect(() => {
    if (phase !== "rolling" || rollInstant) return;
    const done = window.setTimeout(() => dispatch({ type: "ROLL_COMPLETE", rollId }), ROLL_TOTAL_MS);
    return () => window.clearTimeout(done);
  }, [phase, rollId, rollInstant]);


  const { playRoll } = audio;
  const soundedRoll = useRef(0);
  useEffect(() => {
    if (rollId === 0 || soundedRoll.current === rollId || !selectedDrug) return;
    if (phase !== "rolling" && !(phase === "result" && rollInstant)) return;
    soundedRoll.current = rollId;
    void playRoll({ pinsDown: pinsDownCount(selectedDrug), totalPins: TOTAL_PINS, instant: rollInstant });
  }, [phase, rollId, rollInstant, selectedDrug, playRoll]);

  const actions = useMemo(
    () => ({
      start: () => dispatch({ type: "START_SESSION" }),
      newSession: () => dispatch({ type: "NEW_SESSION" }),
      selectDrug: (drug: DrugId) => dispatch({ type: "SELECT_DRUG", drug }),
      chooseAnother: () => dispatch({ type: "CHOOSE_ANOTHER" }),
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

  return { state, ...actions, roll, setSound, playEnding: audio.playEnding, playQuestion: audio.playQuestion };
}

export type GameController = ReturnType<typeof useGameState>;

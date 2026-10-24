"use client";

import { useCallback, useEffect, useRef } from "react";
import { buildSoundCues, SOUND_FILES, SOUND_ONSETS, type SoundName } from "@/lib/rollSound";

export function useGameAudio(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Partial<Record<SoundName, AudioBuffer>>>({});
  const loadingRef = useRef<Promise<void> | null>(null);
  const activeRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") void ctx.resume();
    if (!loadingRef.current) {
      // Fetch and decode both recordings once; they are small local files.
      loadingRef.current = Promise.all(
        (Object.keys(SOUND_FILES) as SoundName[]).map(async (name) => {
          try {
            const res = await fetch(SOUND_FILES[name]);
            buffersRef.current[name] = await ctx.decodeAudioData(await res.arrayBuffer());
          } catch {
            /* missing or undecodable file: the game simply stays silent */
          }
        }),
      ).then(() => undefined);
    }
    return ctx;
  }, []);

  /** Unlocks audio from a user gesture (e.g. turning sound back on). */
  const unlock = useCallback(() => {
    ensureContext();
  }, [ensureContext]);

  useEffect(() => {
    if (!enabled) return;
    const events = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;
    const onGesture = () => {
      const ctx = ensureContext();
      if (ctx?.state === "running") detach();
    };
    const detach = () => events.forEach((e) => window.removeEventListener(e, onGesture, true));
    events.forEach((e) => window.addEventListener(e, onGesture, true));
    return detach;
  }, [enabled, ensureContext]);

  const stopAll = useCallback(() => {
    for (const node of activeRef.current) {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    }
    activeRef.current.clear();
  }, []);

  useEffect(() => {
    if (!enabled) stopAll();
  }, [enabled, stopAll]);

  useEffect(
    () => () => {
      stopAll();
      void ctxRef.current?.close();
      ctxRef.current = null;
    },
    [stopAll],
  );

  /** Schedules the roll's sounds on the audio clock, in sync with the animation. */
  const playRoll = useCallback(
    async (plan: { pinsDown: number; totalPins: number; instant?: boolean }) => {
      if (!enabled) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      const requestedAt = ctx.currentTime;
      await loadingRef.current;
      // If decoding took a moment, keep the timeline anchored to when the roll began.
      const t0 = requestedAt + 0.03;
      for (const cue of buildSoundCues(plan.pinsDown, plan.totalPins, plan.instant)) {
        const buffer = buffersRef.current[cue.sound];
        if (!buffer) continue;
        const onset = SOUND_ONSETS[cue.sound];
        // Start the file so its onset is heard at t0 + cue.at; if that moment
        // has passed (or is too close), skip into the file instead.
        const startAt = t0 + cue.at - onset;
        const now = ctx.currentTime + 0.01;
        const when = Math.max(now, startAt);
        const offset = Math.max(0, when - startAt);
        if (offset >= buffer.duration) continue;

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(cue.gain, when);
        src.connect(gain).connect(master);
        src.start(when, offset);
        if (cue.fadeFrom !== undefined && cue.fadeTo !== undefined) {
          const from = Math.max(when, t0 + cue.fadeFrom);
          const to = Math.max(from + 0.01, t0 + cue.fadeTo);
          gain.gain.setValueAtTime(cue.gain, from);
          gain.gain.linearRampToValueAtTime(0.0001, to);
          src.stop(to + 0.02);
        }
        activeRef.current.add(src);
        src.onended = () => activeRef.current.delete(src);
      }
    },
    [enabled, ensureContext],
  );

  return { unlock, playRoll, stopAll };
}

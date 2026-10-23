"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Small synthesised roll and pin sounds via the Web Audio API. Nothing is
 * created until the player turns sound on (a user gesture), and nothing
 * plays while sound is off. No audio files or network requests.
 */
export function useGameAudio(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const activeRef = useRef<AudioScheduledSourceNode[]>([]);

  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.35;
      // Gentle limiter to avoid sudden peaks.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 6;
      master.connect(comp).connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  /** Call from the sound toggle's click handler to unlock audio. */
  const unlock = useCallback(() => {
    ensureContext();
  }, [ensureContext]);

  const stopAll = useCallback(() => {
    for (const node of activeRef.current) {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    }
    activeRef.current = [];
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

  const noiseBuffer = useCallback((ctx: AudioContext, seconds: number) => {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }, []);

  /** Low rumble that builds over the roll duration. */
  const playRoll = useCallback(
    (durationMs: number) => {
      if (!enabled) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      const seconds = durationMs / 1000;
      const t0 = ctx.currentTime;

      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx, seconds + 0.2);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(180, t0);
      lp.frequency.linearRampToValueAtTime(320, t0 + seconds);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.5, t0 + 0.25);
      gain.gain.linearRampToValueAtTime(0.75, t0 + seconds * 0.9);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds + 0.15);
      src.connect(lp).connect(gain).connect(master);
      src.start(t0);
      src.stop(t0 + seconds + 0.2);
      activeRef.current.push(src);
    },
    [enabled, ensureContext, noiseBuffer],
  );

  /** Restrained clatter: one short knock per falling pin. */
  const playPins = useCallback(
    (count: number) => {
      if (!enabled || count <= 0) return;
      const ctx = ensureContext();
      const master = masterRef.current;
      if (!ctx || !master) return;
      const t0 = ctx.currentTime;
      const knocks = Math.min(count * 2, 14);
      for (let i = 0; i < knocks; i++) {
        const t = t0 + i * 0.045 + Math.random() * 0.03;
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(900 + Math.random() * 700, t);
        osc.frequency.exponentialRampToValueAtTime(260, t + 0.08);
        const g = ctx.createGain();
        const peak = 0.22 * (1 - i / (knocks + 4));
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + 0.14);
        activeRef.current.push(osc);
      }
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx, 0.5);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2400;
      bp.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
      src.connect(bp).connect(g).connect(master);
      src.start(t0);
      src.stop(t0 + 0.5);
      activeRef.current.push(src);
    },
    [enabled, ensureContext, noiseBuffer],
  );

  return { unlock, playRoll, playPins, stopAll };
}

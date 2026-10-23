"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

function detect(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    cached = !!gl;
    // Release the probe context straight away.
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

/**
 * "pending" during SSR / first paint, then true or false. Lets the shell show
 * the 2D lane until it knows whether the 3D scene can run.
 */
export function useWebGLSupport(): boolean | "pending" {
  return useSyncExternalStore<boolean | "pending">(
    () => () => {},
    detect,
    () => "pending",
  );
}

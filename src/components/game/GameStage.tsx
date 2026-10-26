"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { pinPosition } from "@/lib/laneLayout";
import { createProjector } from "@/lib/projection";
import { DRUGS } from "@/data/gameData";
import { useElementSize } from "@/hooks/useElementSize";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import type { DrugId, GamePhase, LanePins, Pin, RollResult } from "@/types/game";
import { BallLabels } from "./BallLabels";
import type { BowlingSceneProps } from "./BowlingScene";
import { LaneFallback2D } from "./LaneFallback2D";
import { PinLabelsOverlay } from "./PinLabelsOverlay";
import { SwipeToRoll } from "./SwipeToRoll";

// Three.js only runs in the browser; keep it out of the server bundle.
const BowlingScene = dynamic(() => import("./BowlingScene"), { ssr: false });

function rootFontPx(): number {
  if (typeof window === "undefined") return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

class SceneErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const COUNTER_STYLE: Record<DrugId, string> = {
  azithromycin: "bg-brand-red text-white",
  amoxclav: "bg-brand-navy text-white",
  nafithromycin: "bg-brand-gold text-brand-navy",
};

interface GameStageProps {
  phase: GamePhase;
  selectedDrug: DrugId | null;
  result: RollResult | null;
  rollStartedAt: number | null;
  interactive: boolean;
  pinName: (pin: Pin) => string;
  onPinSelect: (pin: Pin) => void;
  /** Every pin's state right now (see laneBefore / rollLane). */
  lane: LanePins;
  /** Start the roll (swipe gesture or keyboard). Omit to disable rolling. */
  onRoll?: () => void;
  /** Classes for the lane itself (size / aspect). */
  className?: string;
  /** Classes for the wrapper around the lane and its pin key. */
  wrapperClassName?: string;
  /** "card": rounded, raised panel. "bleed": edge-to-edge (intro). */
  variant?: "card" | "bleed";
  /** Show the pin number/label chips (off for the intro preview). */
  showLabels?: boolean;
  /** Force the 2D lane (used by tests and as a manual fallback). */
  force2D?: boolean;
}

export function GameStage({
  phase,
  selectedDrug,
  result,
  rollStartedAt,
  interactive,
  pinName,
  onPinSelect,
  lane,
  onRoll,
  className = "",
  wrapperClassName = "",
  variant = "card",
  showLabels = true,
  force2D = false,
}: GameStageProps) {
  const reduce = useReducedMotion();
  const webgl = useWebGLSupport();
  const [sceneFailed, setSceneFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  // When neighbouring pins are too close for full chips, the chips show
  // numbers only and a key below the lane names them.
  const compact = useMemo(() => {
    if (!stageSize.width || !stageSize.height) return false;
    const project = createProjector(stageSize.width, stageSize.height);
    const a = pinPosition(2);
    const b = pinPosition(3);
    const spacing = Math.abs(project(b.x, 0, b.z).x - project(a.x, 0, a.z).x);
    return spacing < 4.8 * rootFontPx();
  }, [stageSize.width, stageSize.height]);
  const aimRef = useRef(0);
  const [aiming, setAiming] = useState(false);
  // A fresh lane (new ball picked, or back to selecting) starts at the foul line.
  useEffect(() => {
    if (phase !== "rolling") aimRef.current = 0;
  }, [phase, selectedDrug]);
  const handleFail = useCallback(() => setSceneFailed(true), []);
  const handleReady = useCallback(() => setSceneReady(true), []);

  const use3D = !force2D && webgl === true && !sceneFailed;

  const sceneProps: BowlingSceneProps = {
    phase,
    ballDrug: selectedDrug,
    lane,
    rollStartedAt,
    interactive,
    onPinSelect,
    onContextLost: handleFail,
    onReady: handleReady,
    aimRef,
    aiming,
  };

  return (
    <div className={`flex flex-col ${wrapperClassName}`}>
    <div
      ref={stageRef}
      className={`lane-stage relative isolate overflow-hidden ${variant === "card" ? "rounded-3xl shadow-lift" : ""} ${compact ? "lane-compact" : ""} ${className}`}
    >
      {/* 2D lane: the no-WebGL fallback, and the placeholder while 3D loads. */}
      {(!use3D || !sceneReady) && (
        <LaneFallback2D phase={phase} ballDrug={selectedDrug} lane={lane} rollStartedAt={rollStartedAt} />
      )}
      {use3D && (
        <SceneErrorBoundary onError={handleFail}>
          <div className={`absolute inset-0 transition-opacity duration-300 ${sceneReady ? "opacity-100" : "opacity-0"}`}>
            <BowlingScene {...sceneProps} />
          </div>
        </SceneErrorBoundary>
      )}

      {showLabels && (
        <PinLabelsOverlay
          phase={phase}
          lane={lane}
          interactive={interactive}
          pinName={pinName}
          onPinSelect={onPinSelect}
        />
      )}

      {phase === "intro" && <BallLabels width={stageSize.width} height={stageSize.height} />}

      {onRoll && (
        <SwipeToRoll
          phase={phase}
          hasBall={selectedDrug !== null}
          width={stageSize.width}
          height={stageSize.height}
          aimRef={aimRef}
          onAimingChange={setAiming}
          onRoll={onRoll}
        />
      )}

      {!use3D && webgl === false && (
        <p className="absolute right-3 top-3 z-20 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white">
          2D view (3D graphics unavailable on this device)
        </p>
      )}

      <AnimatePresence>
        {phase === "result" && result && (
          <motion.div
            key={`counter-${result.rollId}`}
            initial={reduce ? false : { opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            className={`absolute left-3 top-3 z-20 flex items-center gap-3 rounded-2xl px-4 py-2.5 shadow-lift sm:left-6 sm:top-6 sm:px-6 sm:py-3.5 ${COUNTER_STYLE[result.drug]}`}
            aria-hidden
          >
            <svg viewBox="0 0 24 32" className="h-9 w-7 sm:h-12 sm:w-9" aria-hidden>
              <path d="M7 31c-4 0-5-6-4-12 1-5 3-7 2-10C4 5 5 1 8 1s4 4 3 8c-1 3 1 5 2 10s0 12-6 12z" fill="currentColor" />
              <path d="M17 31c-3 0-4-5-3-10 1-4 2-6 1-8-1-3 0-6 2-6s3 3 2 6c-1 2 0 4 1 8s0 10-3 10z" fill="currentColor" opacity="0.55" />
            </svg>
            <span className="leading-none">
              <span className="block text-xs font-bold uppercase tracking-[0.16em] opacity-90 sm:text-sm">Pins down</span>
              <span className="mt-1 block font-display text-3xl font-black sm:text-5xl">
                {result.pinsDown} of {result.totalPins}
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "rolling" && selectedDrug && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-ink/80 px-8 py-2.5 text-lg font-bold text-white sm:bottom-6 sm:text-xl"
            aria-hidden
          >
            Rolling {DRUGS[selectedDrug].name}…
          </motion.p>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useMemo, useRef, useState, type MutableRefObject, type PointerEvent } from "react";
import { BALL_RADIUS, BALL_START_Z } from "@/lib/laneLayout";
import { createProjector } from "@/lib/projection";
import type { GamePhase } from "@/types/game";

interface SwipeToRollProps {
  phase: GamePhase;
  /** A ball has been picked. */
  hasBall: boolean;
  width: number;
  height: number;
  aimRef: MutableRefObject<number>;
  onAimingChange: (aiming: boolean) => void;
  onRoll: () => void;
}

/** Fraction of the stage height a full swipe covers. */
const FULL_SWIPE = 0.32;
/** Minimum upward travel (fraction of stage height) to count as a roll. */
const MIN_SWIPE = 0.07;
/** A quick flick also counts, even if short (px per ms). */
const FLICK_SPEED = 0.55;
/** The swipe zone covers the lane below this fraction of the stage height. */
const ZONE_TOP = 0.42;

/**
 * Touch / mouse gesture for rolling: put a finger on the lane and swipe up.
 * The ball follows the finger a little and is released into the roll. The
 * gesture only starts the roll; its strength never changes the path, speed or
 * outcome. Keyboard users can focus the ball and press Enter or Space.
 */
export function SwipeToRoll({ phase, hasBall, width, height, aimRef, onAimingChange, onRoll }: SwipeToRollProps) {
  const reduce = useReducedMotion();
  const enabled = phase === "selecting" && hasBall;
  const gesture = useRef<{ id: number; x: number; y: number; samples: { y: number; t: number }[] } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(false);
  const snapBack = useRef(0);

  const ball = useMemo(() => {
    if (!width || !height) return null;
    const project = createProjector(width, height);
    const c = project(0, BALL_RADIUS, BALL_START_Z);
    const top = project(0, BALL_RADIUS * 2, BALL_START_Z);
    // y is relative to the swipe zone, which starts at ZONE_TOP.
    return { x: c.x, y: c.y - height * ZONE_TOP, r: Math.max(24, Math.abs(c.y - top.y)) };
  }, [width, height]);

  const progressFor = (clientY: number) => {
    const g = gesture.current;
    if (!g || !height) return 0;
    return Math.min(1, Math.max(0, (g.y - clientY) / (height * FULL_SWIPE)));
  };

  const end = (rolled: boolean) => {
    gesture.current = null;
    setDragging(false);
    setArmed(false);
    if (rolled) {
      onAimingChange(false);
      return;
    }
    // Ease the ball back to the foul line.
    cancelAnimationFrame(snapBack.current);
    const from = aimRef.current;
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / 200);
      aimRef.current = from * (1 - k) * (1 - k);
      if (k < 1) snapBack.current = requestAnimationFrame(step);
      else onAimingChange(false);
    };
    snapBack.current = requestAnimationFrame(step);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled || gesture.current) return;
    cancelAnimationFrame(snapBack.current);
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // keep tracking if the finger leaves the lane
    } catch {
      /* not supported */
    }
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, samples: [{ y: e.clientY, t: e.timeStamp }] };
    aimRef.current = 0;
    setDragging(true);
    onAimingChange(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    g.samples.push({ y: e.clientY, t: e.timeStamp });
    if (g.samples.length > 8) g.samples.shift();
    const p = progressFor(e.clientY);
    aimRef.current = p;
    const nowArmed = g.y - e.clientY >= height * MIN_SWIPE;
    if (nowArmed !== armed) setArmed(nowArmed);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    const dy = g.y - e.clientY; // upward is positive
    const dx = Math.abs(e.clientX - g.x);
    const first = g.samples[0]!;
    const speed = (first.y - e.clientY) / Math.max(1, e.timeStamp - first.t);
    const upward = dy > dx * 0.6;
    const rolled = enabled && upward && (dy >= height * MIN_SWIPE || (speed >= FLICK_SPEED && dy >= 20));
    if (rolled) {
      aimRef.current = Math.max(aimRef.current, 0.15);
      onRoll();
    }
    end(rolled);
  };

  const onPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id === e.pointerId) end(false);
  };

  const showHint = enabled && !dragging;
  const showPick = phase === "selecting" && !hasBall;

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[5] select-none"
      style={{ top: `${ZONE_TOP * 100}%`, touchAction: enabled ? "none" : "auto", cursor: enabled ? (dragging ? "grabbing" : "grab") : "default" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      data-testid="swipe-zone"
    >
      {/* Keyboard / screen reader control sitting on the ball. Pointer clicks
          (detail > 0) are ignored so a tap never rolls; only a swipe does. */}
      {ball && (
        <button
          type="button"
          disabled={!enabled}
          onClick={(e) => {
            if (e.detail === 0 && enabled) onRoll();
          }}
          aria-label="Roll the ball. On the touch screen, swipe the ball up the lane."
          className="absolute rounded-full outline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-gold"
          style={{
            left: ball.x - ball.r * 1.15,
            top: ball.y - ball.r * 1.15,
            width: ball.r * 2.3,
            height: ball.r * 2.3,
          }}
        />
      )}

      <AnimatePresence>
        {showHint && ball && (
          <motion.div
            key="hint"
            className="pointer-events-none absolute flex flex-col items-center"
            style={{ left: ball.x, top: ball.y - ball.r * 1.4, translateX: "-50%", translateY: "-100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="-my-2 block text-white drop-shadow"
                animate={reduce ? undefined : { y: [6, -6], opacity: [0.2, 1, 0.2] }}
                transition={reduce ? undefined : { duration: 1.2, repeat: Infinity, delay: (2 - i) * 0.18 }}
              >
                <ChevronUp className="h-9 w-9" strokeWidth={3} />
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {(showHint || showPick || dragging) && (
        <p
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/80 px-6 py-2.5 text-base font-bold text-white shadow-lift sm:bottom-6 sm:text-lg"
          aria-hidden
        >
          {showPick ? "Pick a ball below" : dragging ? (armed ? "Let go to roll" : "Keep swiping up") : "Swipe the ball up to roll"}
        </p>
      )}
    </div>
  );
}

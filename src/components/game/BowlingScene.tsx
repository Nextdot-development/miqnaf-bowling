"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { CONVENTIONAL_BALLS } from "@/data/gameData";
import { CAMERA, FRONT_ROW_Z, introBallX, verticalFovFor } from "@/lib/laneLayout";
import { ballLineFor, ballPose, STRAIGHT_LINE } from "@/lib/rollAnimation";
import { BALL_COLORS } from "@/lib/drugVisuals";
import type { DrugId, GamePhase, LanePins, Pin } from "@/types/game";
import { BowlingBall } from "./BowlingBall";
import { BallReturn } from "./BallReturn";
import { BowlingLane } from "./BowlingLane";
import { PinDeck } from "./PinDeck";
import { PinSetter } from "./PinSetter";
import { elapsedMs, SceneTimelineContext, type SceneTimeline } from "./sceneClock";
import { BALL_TRAVEL_MS } from "@/lib/timing";

export interface BowlingSceneProps {
  phase: GamePhase;
  /** Selected drug: sets the ball colour. */
  ballDrug: DrugId | null;
  /** Every pin's state for this throw (up, down or wobble). */
  lane: LanePins;
  rollStartedAt: number | null;
  /** Fixes the ball's curved line (shared by both throws of a session). */
  lineSeed: number | null;
  /** The swipe's direction for this throw (null: none). */
  lineAim?: number | null;
  /** The first throw's ball: fixes the line through the rack (shared by both throws). */
  lineDrug: DrugId | null;
  /** When the transition's rack reset started, if it has. */
  rackResetAt?: number | null;
  interactive: boolean;
  onPinSelect: (pin: Pin) => void;
  onContextLost?: () => void;
  /** Called once the WebGL renderer is up. */
  onReady?: () => void;
  /** Swipe progress 0..1, written by the swipe overlay. */
  aimRef: MutableRefObject<number>;
  /** True while the player is dragging the ball (renders every frame). */
  aiming: boolean;
  /** Balls waiting on the ball return beside the lane. */
  rackBalls?: readonly DrugId[];
  /** Choosing a therapy: tapping a ball on the return picks it. */
  onRackSelect?: (drug: DrugId) => void;
}

const smooth01 = (v: number) => {
  const k = Math.min(1, Math.max(0, v));
  return k * k * (3 - 2 * k);
};
const restPos = new THREE.Vector3(...CAMERA.position);
const restLook = new THREE.Vector3(...CAMERA.target);
const camPos = new THREE.Vector3();
const camLook = new THREE.Vector3();
const chasePos = new THREE.Vector3();
const chaseLook = new THREE.Vector3();

/**
 * The camera. At rest (choosing, aiming, results) it holds its fixed framing,
 * which the pin tags and the swipe control are drawn for. While the ball
 * rolls it drops in low behind the ball and chases it down the lane, ending in
 * a close-up of the pin deck, with a jolt as the ball smashes in.
 */
function CameraRig({ hits, strike }: { hits: boolean; strike: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const timeline = useContext(SceneTimelineContext);
  const reduce = typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    camera.fov = verticalFovFor(size.width / Math.max(size.height, 1));
    camera.near = 0.05;
    camera.far = 40;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame(() => {
    const t = timeline?.current;
    camPos.copy(restPos);
    camLook.copy(restLook);
    if (t && t.phase === "rolling" && !reduce) {
      const ms = elapsedMs(t, performance.now());
      const line = t.lineSeed === null ? STRAIGHT_LINE : ballLineFor(t.lineSeed, t.lineDrug, t.lineAim);
      const b = ballPose(Math.min(ms, BALL_TRAVEL_MS + 450), line);
      // Low behind the ball; it eases to a stop short of the pins and holds on the deck.
      const stop = FRONT_ROW_Z + 0.55;
      const z = stop + 0.3 * Math.log1p(Math.exp((b.z - stop) / 0.3));
      // It follows the ball's line loosely, so a late hook doesn't swing the view.
      chasePos.set(b.x * 0.35, 0.5, z + 1.45);
      chaseLook.set(b.x * 0.2, 0.12, z - 2.4);
      const k = smooth01(ms / 450);
      camPos.lerpVectors(restPos, chasePos, k);
      camLook.lerpVectors(restLook, chaseLook, k);
      const since = ms - BALL_TRAVEL_MS;
      if (hits && since > 0 && since < 420) {
        const amp = (strike ? 0.045 : 0.02) * Math.exp(-since / 120);
        camPos.x += amp * Math.sin(since * 0.21);
        camPos.y += amp * Math.sin(since * 0.33 + 1.3);
      }
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);
  });
  return null;
}

/** Renders a fresh frame whenever the game state changes in demand mode. */
function Invalidator({ deps }: { deps: unknown[] }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
}

function ContextLossWatcher({ onLost }: { onLost?: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (!onLost) return;
    const el = gl.domElement;
    const handler = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    el.addEventListener("webglcontextlost", handler);
    return () => el.removeEventListener("webglcontextlost", handler);
  }, [gl, onLost]);
  return null;
}

function Lights() {
  const key = useRef<THREE.DirectionalLight>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const targets: THREE.Object3D[] = [];
    if (key.current) {
      key.current.target.position.set(0, 0, -1.6);
      targets.push(key.current.target);
    }
    if (spot.current) {
      spot.current.target.position.set(0, 0, FRONT_ROW_Z - 0.2);
      targets.push(spot.current.target);
    }
    targets.forEach((t) => scene.add(t));
    return () => targets.forEach((t) => scene.remove(t));
  }, [scene]);

  return (
    <>
      <hemisphereLight args={["#dde4ff", "#5b4026", 0.55]} />
      {/* Soft fill from behind the camera so ball colours read true. */}
      <pointLight position={[0.5, 1.1, 2.3]} intensity={2.2} decay={1.2} />
      <directionalLight
        ref={key}
        position={[1.2, 5, 1.8]}
        intensity={1.05}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-1.8}
        shadow-camera-right={1.8}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={12}
      />
      <spotLight
        ref={spot}
        position={[0, 2.3, FRONT_ROW_Z + 0.9]}
        angle={0.72}
        penumbra={0.9}
        intensity={9}
        decay={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
      />
      <Environment resolution={256} frames={1} environmentIntensity={0.6}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, -4]} rotation-x={Math.PI / 2} scale={[3, 12, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-4, 2, -3]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[4, 2, -3]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, 2, 4]} scale={2} />
      </Environment>
    </>
  );
}

export default function BowlingScene(props: BowlingSceneProps) {
  const { phase, ballDrug, lane, rollStartedAt, lineSeed, lineAim = null, lineDrug, rackResetAt = null, interactive, onPinSelect, onContextLost, onReady, aimRef, aiming, rackBalls = [], onRackSelect } =
    props;

  // The second throw is at the rack exactly as the first left it: no sweep (client request).
  const sweeping = false;
  const strike = Object.values(lane).every((s) => s === "down");
  const timeline = useRef<SceneTimeline>({ phase, rollStartedAt, lineSeed, lineAim, lineDrug, rackResetAt, sweeping, strike, aim: aimRef });
  timeline.current = { phase, rollStartedAt, lineSeed, lineAim, lineDrug, rackResetAt, sweeping, strike, aim: aimRef };

  return (
    <SceneTimelineContext.Provider value={timeline}>
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        frameloop={phase === "rolling" || phase === "transition" || aiming ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [...CAMERA.position], fov: 30 }}
        className="!absolute inset-0"
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping;
          onReady?.();
        }}
      >
        <CameraRig hits={Object.values(lane).includes("down")} strike={strike} />
        <Invalidator deps={[phase, ballDrug, lane, rollStartedAt, aiming, rackBalls.join()]} />
        <ContextLossWatcher onLost={onContextLost} />
        <Lights />
        <BowlingLane />
        <PinDeck
          lane={lane}
          interactive={interactive}
          onPinSelect={onPinSelect}
        />
        <PinSetter />
        {phase !== "intro" && <BallReturn balls={rackBalls} onSelect={onRackSelect} />}
        {/* Intro: Player 1's two balls line up. In play, only the ball being rolled is on the lane. */}
        {phase === "intro"
          ? CONVENTIONAL_BALLS.map((id, i) => <BowlingBall key={id} color={BALL_COLORS[id]} offsetX={introBallX(i, CONVENTIONAL_BALLS.length)} still />)
          : ballDrug && <BowlingBall color={BALL_COLORS[ballDrug]} />}
      </Canvas>
    </SceneTimelineContext.Provider>
  );
}

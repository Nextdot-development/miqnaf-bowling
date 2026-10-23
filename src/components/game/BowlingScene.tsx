"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { CAMERA, FRONT_ROW_Z, verticalFovFor } from "@/lib/laneLayout";
import { ballColor } from "@/lib/drugVisuals";
import type { DrugId, GamePhase, Pin } from "@/types/game";
import { BowlingBall } from "./BowlingBall";
import { BowlingLane } from "./BowlingLane";
import { PinDeck } from "./PinDeck";
import { SceneTimelineContext, type SceneTimeline } from "./sceneClock";

export interface BowlingSceneProps {
  phase: GamePhase;
  /** Selected drug: sets the ball colour. */
  ballDrug: DrugId | null;
  /** Drug whose outcome the pins are showing. */
  outcomeDrug: DrugId | null;
  rollStartedAt: number | null;
  interactive: boolean;
  onPinSelect: (pin: Pin) => void;
  onContextLost?: () => void;
  /** Called once the WebGL renderer is up. */
  onReady?: () => void;
  /** Swipe progress 0..1, written by the swipe overlay. */
  aimRef: MutableRefObject<number>;
  /** True while the player is dragging the ball (renders every frame). */
  aiming: boolean;
}

/** Fixed camera: same position and framing for every roll. */
function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  useEffect(() => {
    camera.position.set(...CAMERA.position);
    camera.fov = verticalFovFor(size.width / Math.max(size.height, 1));
    camera.near = 0.1;
    camera.far = 40;
    camera.lookAt(...CAMERA.target);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
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
        intensity={7}
        decay={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
      />
      <Environment resolution={256} frames={1} environmentIntensity={0.45}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, -4]} rotation-x={Math.PI / 2} scale={[3, 12, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-4, 2, -3]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[4, 2, -3]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, 2, 4]} scale={2} />
      </Environment>
    </>
  );
}

export default function BowlingScene(props: BowlingSceneProps) {
  const { phase, ballDrug, outcomeDrug, rollStartedAt, interactive, onPinSelect, onContextLost, onReady, aimRef, aiming } =
    props;

  const timeline = useRef<SceneTimeline>({ phase, rollStartedAt, aim: aimRef });
  timeline.current = { phase, rollStartedAt, aim: aimRef };

  return (
    <SceneTimelineContext.Provider value={timeline}>
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        frameloop={phase === "rolling" || aiming ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [...CAMERA.position], fov: 30 }}
        className="!absolute inset-0"
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping;
          onReady?.();
        }}
      >
        <CameraRig />
        <Invalidator deps={[phase, ballDrug, outcomeDrug, rollStartedAt, aiming]} />
        <ContextLossWatcher onLost={onContextLost} />
        <Lights />
        <BowlingLane />
        <PinDeck
          phase={phase}
          outcomeDrug={outcomeDrug}
          interactive={interactive}
          onPinSelect={onPinSelect}
        />
        <BowlingBall color={ballColor(ballDrug)} />
      </Canvas>
    </SceneTimelineContext.Provider>
  );
}

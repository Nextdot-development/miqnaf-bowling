"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BALL_RADIUS, BALL_START_Z } from "@/lib/laneLayout";
import { aimOffset, ballPose } from "@/lib/rollAnimation";
import { createBallTexture } from "./sceneAssets";
import { elapsedMs, useSceneTimeline } from "./sceneClock";

/** Finger and thumb holes, clustered on the camera-facing upper side. */
const HOLES: { dir: [number, number, number]; r: number }[] = [
  { dir: [-0.24, 0.62, 0.75], r: 0.0135 },
  { dir: [0.24, 0.62, 0.75], r: 0.0135 },
  { dir: [0, 0.4, 0.92], r: 0.016 },
];

interface BowlingBallProps {
  color: string;
}

export function BowlingBall({ color }: BowlingBallProps) {
  const group = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  const timeline = useSceneTimeline();

  const texture = useMemo(() => createBallTexture(7), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: 0.22,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      }),
    [texture],
  );

  useEffect(() => {
    material.color.set(color);
  }, [material, color]);

  const holes = useMemo(
    () =>
      HOLES.map(({ dir, r }) => {
        const v = new THREE.Vector3(...dir).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v);
        return { position: v.multiplyScalar(BALL_RADIUS * 1.002), quaternion: q, r };
      }),
    [],
  );

  useEffect(
    () => () => {
      texture.dispose();
      material.dispose();
    },
    [texture, material],
  );

  useFrame(() => {
    const t = timeline.current;
    const elapsed = elapsedMs(t, performance.now());
    const pose = ballPose(elapsed);
    if (!group.current || !spinner.current) return;
    // The swipe nudges the ball forward; that offset fades out as the roll starts.
    const z = pose.z - aimOffset(t.phase, elapsed, t.aim.current);
    group.current.visible = pose.visible;
    group.current.position.set(pose.x, pose.y, z);
    spinner.current.rotation.x = -(BALL_START_Z - z) / BALL_RADIUS;
  });

  return (
    <group ref={group}>
      <group ref={spinner}>
        <mesh material={material} castShadow>
          <sphereGeometry args={[BALL_RADIUS, 64, 48]} />
        </mesh>
        {holes.map((h, i) => (
          <mesh key={i} position={h.position} quaternion={h.quaternion}>
            <circleGeometry args={[h.r, 24]} />
            <meshStandardMaterial color="#0d0d12" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

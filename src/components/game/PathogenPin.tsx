"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SCENE } from "@/lib/brand";
import { pinPosition } from "@/lib/laneLayout";
import { pinPose } from "@/lib/rollAnimation";
import type { Pin } from "@/types/game";
import { elapsedMs, useSceneTimeline } from "./sceneClock";

const WHITE = new THREE.Color(SCENE.pinWhite);
const DIMMED = new THREE.Color("#a9afbf");
const tmpAxis = new THREE.Vector3();

interface PathogenPinProps {
  pin: Pin;
  geometry: THREE.BufferGeometry;
  skin: THREE.Texture;
  /** Whether the outcome matrix scripts this pin to fall on the current roll. */
  falls: boolean;
  interactive: boolean;
  onSelect: (pin: Pin) => void;
}

export function PathogenPin({
  pin,
  geometry,
  skin,
  falls,
  interactive,
  onSelect,
}: PathogenPinProps) {
  const { x, z } = pinPosition(pin.number);
  const body = useRef<THREE.Group>(null);
  const timeline = useSceneTimeline();
  // Keep the latest outcome in a ref so the frame loop never goes stale.
  const fallsRef = useRef(falls);
  fallsRef.current = falls;

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: skin,
        color: WHITE.clone(),
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        transparent: true,
      }),
    [skin],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const g = body.current;
    if (!g) return;
    const pose = pinPose(pin.number, fallsRef.current, elapsedMs(timeline.current, performance.now()));
    g.position.set(pose.dx, pose.lift, pose.dz);
    tmpAxis.set(pose.axisX, 0, pose.axisZ);
    g.quaternion.setFromAxisAngle(tmpAxis, pose.angle);
    g.visible = pose.opacity > 0.01;
    material.opacity = pose.opacity;
    material.depthWrite = pose.opacity > 0.98;
    material.color.lerpColors(WHITE, DIMMED, pose.dim);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelect(pin);
  };

  return (
    <group position={[x, 0, z]}>
      <group ref={body}>
        <mesh
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
          onClick={handleClick}
          onPointerOver={() => {
            if (interactive) document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        />
      </group>

    </group>
  );
}

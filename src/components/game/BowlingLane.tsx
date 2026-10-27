"use client";

import { MeshReflectorMaterial } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { BRAND, SCENE } from "@/lib/brand";
import {
  ARROWS_Z,
  DECK_END_Z,
  FRONT_ROW_Z,
  FOUL_LINE_Z,
  GUTTER_WIDTH,
  LANE_HALF_WIDTH,
  LANE_NEAR_Z,
  PIT_BACK_Z,
} from "@/lib/laneLayout";
import { createWoodTexture } from "./sceneAssets";

const LANE_THICKNESS = 0.05;
const LANE_LENGTH = LANE_NEAR_Z - DECK_END_Z;
const LANE_CENTER_Z = (LANE_NEAR_Z + DECK_END_Z) / 2;
const LANE_WIDTH = LANE_HALF_WIDTH * 2;
const KICKBACK_LENGTH = FRONT_ROW_Z + 0.5 - PIT_BACK_Z;
const KICKBACK_CENTER_Z = PIT_BACK_Z + KICKBACK_LENGTH / 2;
/** World length one repeat of the wood texture covers. */
const WOOD_REPEAT_LENGTH = 2.6;

function makeArrowShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.07);
  s.lineTo(-0.028, -0.05);
  s.lineTo(0.028, -0.05);
  s.closePath();
  return s;
}

export function BowlingLane() {
  const wood = useMemo(() => {
    const tex = createWoodTexture();
    tex.repeat.set(1, LANE_LENGTH / WOOD_REPEAT_LENGTH);
    return tex;
  }, []);

  const laneMaterials = useMemo(() => {
    const top = new THREE.MeshPhysicalMaterial({
      map: wood,
      // A freshly oiled, polished lane: strong clear-coat reflections.
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const edge = new THREE.MeshStandardMaterial({ color: "#7a4f27", roughness: 0.6 });
    // Box faces: +x, -x, +y (top), -y, +z, -z
    return [edge, edge, top, edge, edge, edge];
  }, [wood]);

  const arrowGeometry = useMemo(() => new THREE.ShapeGeometry(makeArrowShape()), []);

  useEffect(
    () => () => {
      wood.dispose();
      laneMaterials.forEach((m) => m.dispose());
      arrowGeometry.dispose();
    },
    [wood, laneMaterials, arrowGeometry],
  );

  const gutterX = LANE_HALF_WIDTH + GUTTER_WIDTH / 2;
  const capX = LANE_HALF_WIDTH + GUTTER_WIDTH + 0.15;
  const arrows = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <group>
      {/* Lane bed */}
      <mesh
        position={[0, -LANE_THICKNESS / 2, LANE_CENTER_Z]}
        material={laneMaterials}
        receiveShadow
      >
        <boxGeometry args={[LANE_WIDTH, LANE_THICKNESS, LANE_LENGTH]} />
      </mesh>

      {/* Mirror-polished surface: the ball and pins reflect in the lane. */}
      <mesh position={[0, 0.0006, LANE_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[LANE_WIDTH, LANE_LENGTH]} />
        <MeshReflectorMaterial
          map={wood}
          mirror={0.55}
          blur={[260, 90]}
          resolution={768}
          mixBlur={1}
          mixStrength={1.1}
          roughness={0.32}
          metalness={0}
          depthScale={0}
        />
      </mesh>

      {/* Foul line */}
      <mesh position={[0, 0.0015, FOUL_LINE_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH, 0.016]} />
        <meshStandardMaterial color="#5a3a1c" roughness={0.5} />
      </mesh>

      {/* Targeting arrows, in the classic shallow V */}
      {arrows.map((i) => (
        <mesh
          key={i}
          geometry={arrowGeometry}
          position={[i * 0.205, 0.0015, ARROWS_Z - Math.abs(i) * 0.16]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial color="#86552a" roughness={0.45} />
        </mesh>
      ))}

      {/* Gutters */}
      {[-1, 1].map((side) => (
        <mesh key={`g${side}`} position={[side * gutterX, -0.06, LANE_CENTER_Z]} receiveShadow>
          <boxGeometry args={[GUTTER_WIDTH, 0.02, LANE_LENGTH]} />
          <meshStandardMaterial color={SCENE.gutter} roughness={0.85} />
        </mesh>
      ))}

      {/* Capping beyond the gutters */}
      {[-1, 1].map((side) => (
        <mesh key={`c${side}`} position={[side * capX, -0.01, LANE_CENTER_Z]}>
          <boxGeometry args={[0.3, 0.04, LANE_LENGTH]} />
          <meshStandardMaterial color={SCENE.gutter} roughness={0.9} />
        </mesh>
      ))}

      {/* Neon rails along both sides of the lane (arena lighting) */}
      {[-1, 1].map((side) => (
        <mesh key={`n${side}`} position={[side * (LANE_HALF_WIDTH + GUTTER_WIDTH + 0.02), 0.02, LANE_CENTER_Z]}>
          <boxGeometry args={[0.035, 0.035, LANE_LENGTH]} />
          <meshStandardMaterial color={BRAND.gold} emissive={BRAND.gold} emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      ))}

      {/* Kickback walls either side of the pin deck */}
      {[-1, 1].map((side) => (
        <mesh key={`k${side}`} position={[side * (LANE_HALF_WIDTH + GUTTER_WIDTH + 0.02), 0.28, KICKBACK_CENTER_Z]}>
          <boxGeometry args={[0.04, 0.66, KICKBACK_LENGTH]} />
          <meshStandardMaterial color={SCENE.gutter} roughness={0.9} />
        </mesh>
      ))}

      {/* The arena: neighbouring lanes either side, each with its own neon rails */}
      {[-2, -1, 1, 2].map((n) => {
        const x = n * (LANE_WIDTH + GUTTER_WIDTH * 2 + 0.55);
        return (
          <group key={`lane${n}`} position={[x, 0, 0]}>
            <mesh position={[0, -0.001, LANE_CENTER_Z - 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[LANE_WIDTH, LANE_LENGTH + 1.2]} />
              <meshStandardMaterial map={wood} color="#8d7aa0" roughness={0.35} metalness={0.1} />
            </mesh>
            <mesh position={[0, -0.03, LANE_CENTER_Z - 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[LANE_WIDTH + GUTTER_WIDTH * 2 + 0.55, LANE_LENGTH + 1.2]} />
              <meshStandardMaterial color={SCENE.gutter} roughness={0.9} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * (LANE_HALF_WIDTH + GUTTER_WIDTH), 0.015, LANE_CENTER_Z - 0.6]}>
                <boxGeometry args={[0.03, 0.03, LANE_LENGTH + 1.2]} />
                <meshStandardMaterial color={BRAND.gold} emissive={BRAND.gold} emissiveIntensity={0.7} toneMapped={false} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* The masking unit over the pin decks: a dark fascia with a gold light strip and a red trim */}
      <mesh position={[0, 1.42, DECK_END_Z + 0.1]}>
        <boxGeometry args={[16, 0.62, 0.12]} />
        <meshStandardMaterial color="#0c1236" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.1, DECK_END_Z + 0.17]}>
        <boxGeometry args={[16, 0.035, 0.02]} />
        <meshStandardMaterial color={BRAND.gold} emissive={BRAND.gold} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.74, DECK_END_Z + 0.17]}>
        <boxGeometry args={[16, 0.02, 0.02]} />
        <meshStandardMaterial color={BRAND.red} emissive={BRAND.red} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>

      {/* Pit and back curtain */}
      <mesh position={[0, -0.35, (DECK_END_Z + PIT_BACK_Z) / 2]}>
        <boxGeometry args={[LANE_WIDTH + GUTTER_WIDTH * 2, 0.1, PIT_BACK_Z - DECK_END_Z]} />
        <meshStandardMaterial color="#0b1030" roughness={1} />
      </mesh>
      <mesh position={[0, 0.5, PIT_BACK_Z]}>
        <planeGeometry args={[16, 2]} />
        <meshStandardMaterial color="#0d143a" roughness={1} />
      </mesh>
    </group>
  );
}

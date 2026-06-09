"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ORBIT_SPEED } from "./constants";
import type { FeatureItem } from "./constants";
import { useEcosystem } from "./ecosystem-context";
import { OrbitCard } from "./orbit-card";

type OrbitLayerProps = {
  radius: number;
  yOffset: number;
  direction: 1 | -1;
  tilt: number;
  features: readonly FeatureItem[];
};

export function OrbitLayer({
  radius,
  yOffset,
  direction,
  tilt,
  features,
}: OrbitLayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { reducedMotion } = useEcosystem();

  const positions = useMemo(() => {
    return features.map((_, i) => {
      const angle = (i / features.length) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        yOffset + Math.sin(angle * 2) * 0.06,
        Math.sin(angle) * radius,
      );
    });
  }, [features, radius, yOffset]);

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y += delta * ORBIT_SPEED * direction;
  });

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.004, 8, 128]} />
        <meshBasicMaterial color="#e5e7eb" transparent opacity={0.35} />
      </mesh>

      {features.map((feature, i) => (
        <OrbitCard key={feature.id} feature={feature} basePosition={positions[i]} />
      ))}
    </group>
  );
}

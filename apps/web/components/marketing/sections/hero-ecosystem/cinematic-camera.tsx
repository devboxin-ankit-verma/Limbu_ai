"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CAMERA_DRIFT_SPEED } from "./constants";
import { useEcosystem } from "./ecosystem-context";

export function CinematicCamera() {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const { scrollProgress, reducedMotion, deviceTier } = useEcosystem();

  const basePosition = deviceTier === "mobile" ? [0, 0.2, 7.2] : [0, 0.35, 6.4];
  const baseFov = deviceTier === "mobile" ? 48 : 42;

  useFrame(({ clock }) => {
    if (!camRef.current || reducedMotion) return;
    const t = clock.elapsedTime;
    const scroll = scrollProgress.current;

    camRef.current.position.x = basePosition[0] + Math.sin(t * CAMERA_DRIFT_SPEED) * 0.18;
    camRef.current.position.y =
      basePosition[1] + Math.cos(t * CAMERA_DRIFT_SPEED * 0.85) * 0.1 + scroll * 0.25;
    camRef.current.position.z = basePosition[2] + scroll * 0.6;

    camRef.current.rotation.y = scroll * 0.22 + Math.sin(t * 0.06 * 0.25) * 0.04;
    camRef.current.rotation.x = -0.06 + scroll * 0.08 + Math.cos(t * 0.05 * 0.25) * 0.02;

    camRef.current.lookAt(0, scroll * 0.15, 0);
    camRef.current.fov = baseFov + scroll * 2;
    camRef.current.updateProjectionMatrix();
  });

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      position={basePosition as [number, number, number]}
      fov={baseFov}
      near={0.1}
      far={100}
    />
  );
}

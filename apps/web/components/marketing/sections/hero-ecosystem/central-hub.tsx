"use client";

import { MeshTransmissionMaterial, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { HUB_BREATH_SPEED, HUB_FLOAT_SPEED } from "./constants";
import { useEcosystem } from "./ecosystem-context";

export function CentralHub() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { reducedMotion, deviceTier } = useEcosystem();
  const isMobile = deviceTier === "mobile";

  const goldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#fbbf24",
        metalness: 0.95,
        roughness: 0.18,
        emissive: "#f59e0b",
        emissiveIntensity: 0.15,
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * HUB_FLOAT_SPEED) * 0.12;
    const breath = 1 + Math.sin(t * HUB_BREATH_SPEED) * 0.018;
    groupRef.current.scale.setScalar(breath);
    if (coreRef.current) coreRef.current.rotation.y = t * 0.01;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.015;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} material={goldMat}>
        <torusGeometry args={[1.05, 0.025, 16, 96]} />
      </mesh>

      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.05, 1.35]} />
        {isMobile ? (
          <meshPhysicalMaterial
            color="#e8f0ff"
            metalness={0.15}
            roughness={0.12}
            transmission={0.85}
            thickness={0.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.2}
          />
        ) : (
          <MeshTransmissionMaterial
            backside
            samples={deviceTier === "tablet" ? 4 : 6}
            resolution={deviceTier === "tablet" ? 192 : 256}
            transmission={0.92}
            thickness={0.65}
            roughness={0.08}
            ior={1.45}
            chromaticAberration={0.04}
            anisotropy={0.12}
            distortion={0.08}
            distortionScale={0.15}
            temporalDistortion={0.05}
            color="#e8f0ff"
            attenuationColor="#fbbf24"
            attenuationDistance={2.5}
          />
        )}
      </mesh>

      <mesh ref={coreRef}>
        <cylinderGeometry args={[0.72, 0.82, 0.42, 6]} />
        <meshStandardMaterial
          color="#2563eb"
          metalness={0.55}
          roughness={0.22}
          emissive="#1d4ed8"
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.5, 0.12, 0.18]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
      </mesh>

      <Text
        position={[0, 0.08, 0.72]}
        fontSize={0.42}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#1d4ed8"
      >
        G
      </Text>

      <pointLight position={[0, 0.5, 0.8]} intensity={1.2} color="#fbbf24" distance={4} />
      <pointLight position={[0, -0.3, -0.6]} intensity={0.5} color="#60a5fa" distance={3} />

      <mesh>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

"use client";

import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { CentralHub } from "./central-hub";
import { CinematicCamera } from "./cinematic-camera";
import { ORBIT_FEATURES, ORBIT_LAYERS, type DeviceTier } from "./constants";
import { EcosystemProvider, type CardWorldRef } from "./ecosystem-context";
import { EnergyLines } from "./energy-lines";
import { OrbitLayer } from "./orbit-layer";
import { ParticleField } from "./particle-field";
import { PostEffects } from "./post-effects";
import { StudioLights } from "./studio-lights";
import { useEcosystem } from "./ecosystem-context";

type SceneProps = {
  scrollProgress: MutableRefObject<number>;
  cardRefs: MutableRefObject<CardWorldRef[]>;
  reducedMotion: boolean;
  deviceTier: DeviceTier;
};

function EcosystemContent() {
  const rootRef = useRef<THREE.Group>(null);
  const { scrollProgress, reducedMotion, deviceTier } = useEcosystem();

  const layers = useMemo(() => {
    if (deviceTier === "mobile") {
      return [
        {
          ...ORBIT_LAYERS[0],
          radius: 1.85,
          features: ORBIT_FEATURES.slice(0, 6),
        },
      ];
    }
    if (deviceTier === "tablet") {
      return ORBIT_LAYERS.map((l) => ({ ...l, radius: l.radius * 0.88 }));
    }
    return [...ORBIT_LAYERS];
  }, [deviceTier]);

  useFrame(() => {
    if (!rootRef.current || reducedMotion) return;
    const scroll = scrollProgress.current;
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      scroll * 0.35,
      0.04,
    );
    rootRef.current.rotation.x = THREE.MathUtils.lerp(
      rootRef.current.rotation.x,
      scroll * 0.08 - 0.02,
      0.04,
    );
  });

  return (
    <group ref={rootRef}>
      <CentralHub />

      {layers.map((layer) => (
        <OrbitLayer
          key={layer.id}
          radius={layer.radius}
          yOffset={layer.yOffset}
          direction={layer.direction}
          tilt={layer.tilt}
          features={layer.features}
        />
      ))}

      <EnergyLines />
      <ParticleField />

      <ContactShadows
        position={[0, -1.55, 0]}
        opacity={0.35}
        scale={12}
        blur={2.8}
        far={5}
        color="#1f2937"
      />
    </group>
  );
}

export function HeroEcosystemScene({
  scrollProgress,
  cardRefs,
  reducedMotion,
  deviceTier,
}: SceneProps) {
  return (
    <EcosystemProvider
      value={{ scrollProgress, cardRefs, reducedMotion, deviceTier }}
    >
      <CinematicCamera />
      <StudioLights />
      <EcosystemContent />
      <PostEffects />
    </EcosystemProvider>
  );
}

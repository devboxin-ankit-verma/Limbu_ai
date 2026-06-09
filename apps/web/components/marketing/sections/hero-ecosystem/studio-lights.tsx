"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useEcosystem } from "./ecosystem-context";

export function StudioLights() {
  const { deviceTier } = useEcosystem();
  const envResolution = deviceTier === "mobile" ? 256 : 512;

  return (
    <>
      <ambientLight intensity={0.45} color="#f8fafc" />
      <directionalLight
        position={[5, 6, 4]}
        intensity={1.35}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#93c5fd" />
      <spotLight
        position={[0, 5, 2]}
        angle={0.45}
        penumbra={0.8}
        intensity={0.9}
        color="#fbbf24"
        castShadow
      />

      <Environment resolution={envResolution}>
        <Lightformer
          intensity={2}
          rotation={[0, 0, 0]}
          position={[0, 4, 2]}
          scale={[8, 2, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={0.8}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
          scale={[10, 10, 1]}
          color="#e2e8f0"
        />
        <Lightformer
          intensity={1.2}
          rotation={[0, Math.PI / 2, 0]}
          position={[-4, 1, 0]}
          scale={[6, 2, 1]}
          color="#fbbf24"
        />
      </Environment>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>
    </>
  );
}

"use client";

import { Canvas } from "@react-three/fiber";
import { HeroGlobeScene } from "./hero-globe-scene";

export default function HeroGlobeCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 4.6], fov: 42, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <HeroGlobeScene />
    </Canvas>
  );
}

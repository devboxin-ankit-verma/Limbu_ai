"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, type MutableRefObject } from "react";
import { getDpr } from "./constants";
import type { CardWorldRef } from "./ecosystem-context";
import { HeroEcosystemScene } from "./hero-ecosystem-scene";
import { useDeviceTier } from "./use-device-tier";

type CanvasProps = {
  scrollProgress: MutableRefObject<number>;
};

export default function HeroEcosystemCanvas({ scrollProgress }: CanvasProps) {
  const deviceTier = useDeviceTier();
  const cardRefs = useRef<CardWorldRef[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Canvas
      shadows
      dpr={getDpr(deviceTier)}
      camera={{ position: [0, 0.35, 6.4], fov: 42, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      style={{ background: "transparent" }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <fog attach="fog" args={["#ffffff", 10, 24]} />
      <Suspense fallback={null}>
        <HeroEcosystemScene
          scrollProgress={scrollProgress}
          cardRefs={cardRefs}
          reducedMotion={reducedMotion}
          deviceTier={deviceTier}
        />
      </Suspense>
    </Canvas>
  );
}

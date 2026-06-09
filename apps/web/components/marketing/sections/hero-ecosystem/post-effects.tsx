"use client";

import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEcosystem } from "./ecosystem-context";

export function PostEffects() {
  const { deviceTier, reducedMotion } = useEcosystem();

  if (reducedMotion || deviceTier === "mobile") {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.35}
          luminanceThreshold={0.82}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={deviceTier === "tablet" ? 2 : 4}>
      <DepthOfField focusDistance={0.012} focalLength={0.024} bokehScale={2.2} height={480} />
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.92}
        mipmapBlur
      />
      <Vignette eskil offset={0.12} darkness={0.35} />
    </EffectComposer>
  );
}

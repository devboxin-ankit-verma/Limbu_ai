"use client";

import dynamic from "next/dynamic";
import { useScrollEcosystem } from "./use-scroll-ecosystem";

const HeroEcosystemCanvas = dynamic(() => import("./hero-ecosystem-canvas"), {
  ssr: false,
  loading: () => <div className="m-hero-eco-fallback" aria-hidden />,
});

export function HeroEcosystem() {
  const scrollProgress = useScrollEcosystem();

  return (
    <div className="m-hero-eco-wrap">
      <div className="m-hero-eco-glow" aria-hidden />
      <HeroEcosystemCanvas scrollProgress={scrollProgress} />
    </div>
  );
}

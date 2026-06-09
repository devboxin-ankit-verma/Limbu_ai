"use client";

import dynamic from "next/dynamic";

const HeroGlobeCanvas = dynamic(() => import("./hero-globe-canvas"), {
  ssr: false,
  loading: () => <div className="m-hero-globe-fallback" aria-hidden />,
});

export function HeroGlobe() {
  return (
    <div className="m-hero-globe-wrap" aria-hidden>
      <div className="m-hero-globe-glow" />
      <HeroGlobeCanvas />
    </div>
  );
}

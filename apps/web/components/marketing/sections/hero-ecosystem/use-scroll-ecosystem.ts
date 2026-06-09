"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useScrollEcosystem() {
  const scrollProgress = useRef(0);

  useEffect(() => {
    const el = document.getElementById("hero");
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return scrollProgress;
}

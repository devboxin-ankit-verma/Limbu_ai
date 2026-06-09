"use client";

import { useEffect, useState } from "react";
import type { DeviceTier } from "./constants";

function tierFromWidth(width: number): DeviceTier {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("desktop");

  useEffect(() => {
    const update = () => setTier(tierFromWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return tier;
}

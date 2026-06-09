"use client";

import { createContext, useContext, type MutableRefObject, type ReactNode } from "react";

export type CardWorldRef = {
  id: string;
  position: { x: number; y: number; z: number };
  hover: number;
};

export type EcosystemState = {
  scrollProgress: MutableRefObject<number>;
  cardRefs: MutableRefObject<CardWorldRef[]>;
  reducedMotion: boolean;
  deviceTier: "desktop" | "tablet" | "mobile";
};

const EcosystemContext = createContext<EcosystemState | null>(null);

export function EcosystemProvider({
  value,
  children,
}: {
  value: EcosystemState;
  children: ReactNode;
}) {
  return <EcosystemContext.Provider value={value}>{children}</EcosystemContext.Provider>;
}

export function useEcosystem() {
  const ctx = useContext(EcosystemContext);
  if (!ctx) throw new Error("useEcosystem must be used within EcosystemProvider");
  return ctx;
}

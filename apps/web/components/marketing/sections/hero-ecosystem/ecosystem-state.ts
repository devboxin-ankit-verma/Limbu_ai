import { create } from "zustand";

type EcosystemState = {
  scrollProgress: number;
  hoveredCardId: string | null;
  setScrollProgress: (v: number) => void;
  setHoveredCardId: (id: string | null) => void;
};

export const useEcosystemState = create<EcosystemState>((set) => ({
  scrollProgress: 0,
  hoveredCardId: null,
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setHoveredCardId: (hoveredCardId) => set({ hoveredCardId }),
}));

/** Lightweight refs for useFrame (no re-renders) */
export const ecosystemRefs = {
  cardPositions: new Map<string, [number, number, number]>(),
};

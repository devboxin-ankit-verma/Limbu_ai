export const MOTION_SCALE = 0.25;

export const ORBIT_SPEED = 0.12 * MOTION_SCALE;
export const HUB_FLOAT_SPEED = 0.35 * MOTION_SCALE;
export const HUB_BREATH_SPEED = 0.5 * MOTION_SCALE;
export const CAMERA_DRIFT_SPEED = 0.08 * MOTION_SCALE;
export const PARTICLE_SPEED = 0.06 * MOTION_SCALE;

export type FeatureItem = {
  id: string;
  title: string;
  icon: string;
};

export const ORBIT_FEATURES: FeatureItem[] = [
  { id: "instagram", title: "Instagram Automation", icon: "◎" },
  { id: "reviews", title: "AI Review Replies", icon: "★" },
  { id: "citations", title: "Citation Builder", icon: "⬡" },
  { id: "ranking", title: "GMB Ranking", icon: "↗" },
  { id: "images", title: "AI Image Creation", icon: "◈" },
  { id: "facebook", title: "Facebook Automation", icon: "f" },
  { id: "video", title: "Video Generation", icon: "▶" },
  { id: "analytics", title: "Advanced Analytics", icon: "◫" },
  { id: "qr", title: "QR Generator", icon: "⊞" },
  { id: "seo", title: "Local SEO", icon: "⌖" },
];

export const ORBIT_LAYERS = [
  {
    id: "inner",
    radius: 2.15,
    yOffset: 0.05,
    direction: 1 as const,
    tilt: 0.12,
    features: ORBIT_FEATURES.slice(0, 4),
  },
  {
    id: "middle",
    radius: 2.75,
    yOffset: -0.08,
    direction: -1 as const,
    tilt: -0.1,
    features: ORBIT_FEATURES.slice(4, 7),
  },
  {
    id: "outer",
    radius: 3.35,
    yOffset: 0.12,
    direction: 1 as const,
    tilt: 0.08,
    features: ORBIT_FEATURES.slice(7, 10),
  },
] as const;

export type DeviceTier = "desktop" | "tablet" | "mobile";

export function getParticleCount(tier: DeviceTier): number {
  if (tier === "desktop") return 20000;
  if (tier === "tablet") return 10000;
  return 5000;
}

export function getDpr(tier: DeviceTier): [number, number] {
  if (tier === "mobile") return [1, 1.5];
  if (tier === "tablet") return [1, 1.75];
  return [1, 2];
}

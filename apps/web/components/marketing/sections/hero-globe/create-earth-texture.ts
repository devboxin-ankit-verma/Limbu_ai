import * as THREE from "three";

function drawContinent(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  fill: string,
) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Procedural premium earth texture — no external assets required */
export function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create earth texture canvas");
  }

  const ocean = ctx.createLinearGradient(0, 0, 0, 1024);
  ocean.addColorStop(0, "#0a1f3d");
  ocean.addColorStop(0.45, "#123a6b");
  ocean.addColorStop(1, "#0c2a52");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, 2048, 1024);

  ctx.filter = "blur(18px)";
  const land = "#1a5c45";
  const landLight = "#2d7a5a";

  drawContinent(ctx, [[180, 280], [420, 220], [520, 320], [480, 480], [300, 520], [160, 420]], land);
  drawContinent(ctx, [[520, 260], [780, 240], [920, 360], [860, 520], [620, 500], [500, 380]], landLight);
  drawContinent(ctx, [[980, 300], [1280, 260], [1480, 340], [1420, 520], [1100, 540], [960, 420]], land);
  drawContinent(ctx, [[1500, 320], [1780, 300], [1900, 420], [1820, 600], [1580, 580], [1480, 440]], landLight);
  drawContinent(ctx, [[1680, 680], [1860, 720], [1920, 860], [1760, 920], [1620, 820]], land);
  drawContinent(ctx, [[300, 620], [520, 600], [580, 780], [420, 900], [240, 820]], landLight);

  ctx.filter = "none";

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 1024;
    const r = 20 + Math.random() * 80;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const cityLights = [
    [340, 360], [520, 400], [680, 320], [1100, 380], [1320, 340],
    [1560, 420], [1720, 760], [420, 720], [900, 440], [1240, 460],
  ];
  for (const [x, y] of cityLights) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 28);
    glow.addColorStop(0, "rgba(251, 191, 36, 0.9)");
    glow.addColorStop(0.4, "rgba(251, 191, 36, 0.35)");
    glow.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Base spin rate × 0.25 = slow premium rotation */
export const EARTH_ROTATION_SPEED = 0.2 * 0.25;

export const BUSINESS_HUBS = [
  { lat: 40.7, lng: -74.0, label: "New York" },
  { lat: 51.5, lng: -0.1, label: "London" },
  { lat: 25.2, lng: 55.3, label: "Dubai" },
  { lat: 19.1, lng: 72.9, label: "Mumbai" },
  { lat: 48.9, lng: 2.3, label: "Paris" },
  { lat: 35.7, lng: 139.7, label: "Tokyo" },
  { lat: -33.9, lng: 18.4, label: "Cape Town" },
  { lat: -23.5, lng: -46.6, label: "São Paulo" },
] as const;

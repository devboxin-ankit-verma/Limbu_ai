"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PARTICLE_SPEED, getParticleCount } from "./constants";
import { useEcosystem } from "./ecosystem-context";

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const { deviceTier, scrollProgress, reducedMotion } = useEcosystem();
  const count = getParticleCount(deviceTier);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 1.8 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const isGold = Math.random() > 0.55;
      const c = isGold ? new THREE.Color("#fbbf24") : new THREE.Color("#ffffff");
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      speeds[i] = 0.3 + Math.random() * 0.7;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.PointsMaterial({
      size: deviceTier === "mobile" ? 0.018 : 0.012,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    return { geometry: geo, material: mat };
  }, [count, deviceTier]);

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current || reducedMotion) return;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const speeds = geometry.attributes.aSpeed as THREE.BufferAttribute;
    const scroll = scrollProgress.current;
    const t = clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const speed = speeds.getX(i) * PARTICLE_SPEED;
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const angle = speed * delta;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const nx = x * cos - z * sin;
      const nz = x * sin + z * cos;
      pos.setXYZ(
        i,
        nx + Math.sin(t * 0.3 + i) * 0.0008,
        y + Math.sin(t * 0.5 * 0.25 + i * 0.01) * 0.0006 * (1 + scroll),
        nz + Math.cos(t * 0.25 + i) * 0.0008,
      );
    }
    pos.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.02 * 0.25;
  });

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled />;
}

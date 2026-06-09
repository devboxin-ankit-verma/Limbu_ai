"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ORBIT_FEATURES } from "./constants";
import { useEcosystem } from "./ecosystem-context";

function EnergyLine({ featureId }: { featureId: string }) {
  const lineRef = useRef<THREE.Line>(null);
  const { cardRefs, reducedMotion } = useEcosystem();
  const hoverRef = useRef(0);
  const pulseRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#fbbf24"),
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    [],
  );

  const lineObj = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  useFrame(({ clock }) => {
    const card = cardRefs.current.find((c) => c.id === featureId);
    if (!card) return;

    const pos = geometry.attributes.position as THREE.BufferAttribute;
    pos.setXYZ(0, 0, 0, 0);
    pos.setXYZ(1, card.position.x, card.position.y, card.position.z);
    pos.needsUpdate = true;

    const targetHover = card.hover;
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, targetHover, 0.08);
    pulseRef.current = reducedMotion
      ? 0.5
      : (Math.sin(clock.elapsedTime * 0.8 * 0.25 + featureId.length) + 1) * 0.5;

    material.opacity = 0.1 + pulseRef.current * 0.15 + hoverRef.current * 0.4;
    material.color.lerpColors(
      new THREE.Color("#ffffff"),
      new THREE.Color("#fbbf24"),
      hoverRef.current,
    );
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <primitive ref={lineRef} object={lineObj} />;
}

export function EnergyLines() {
  const { deviceTier } = useEcosystem();

  const activeFeatures = useMemo(() => {
    if (deviceTier === "mobile") return ORBIT_FEATURES.slice(0, 6);
    return ORBIT_FEATURES;
  }, [deviceTier]);

  return (
    <group>
      {activeFeatures.map((f) => (
        <EnergyLine key={f.id} featureId={f.id} />
      ))}
    </group>
  );
}

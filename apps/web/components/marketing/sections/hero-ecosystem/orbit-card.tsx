"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { FeatureItem } from "./constants";
import { useEcosystem } from "./ecosystem-context";

type OrbitCardProps = {
  feature: FeatureItem;
  basePosition: THREE.Vector3;
};

export function OrbitCard({ feature, basePosition }: OrbitCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const worldPos = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);
  const hoverRef = useRef(0);
  const { cardRefs, reducedMotion } = useEcosystem();

  useEffect(() => {
    const entry = { id: feature.id, position: { x: 0, y: 0, z: 0 }, hover: 0 };
    cardRefs.current.push(entry);
    const idx = cardRefs.current.length - 1;
    return () => {
      cardRefs.current.splice(idx, 1);
    };
  }, [cardRefs, feature.id]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(worldPos.current);

    const entry = cardRefs.current.find((c) => c.id === feature.id);
    if (entry) {
      entry.position.x = worldPos.current.x;
      entry.position.y = worldPos.current.y;
      entry.position.z = worldPos.current.z;
    }

    const target = hovered ? 1 : 0;
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, target, reducedMotion ? 1 : 0.06);
    if (entry) entry.hover = hoverRef.current;

    const lift = hoverRef.current * 0.14;
    groupRef.current.position.y = basePosition.y + lift;
  });

  return (
    <group ref={groupRef} position={basePosition}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[1.35, 0.52]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Html
        transform
        occlude
        distanceFactor={6}
        style={{ pointerEvents: "auto" }}
        zIndexRange={[80, 0]}
      >
        <div
          className={`m-eco-card${hovered ? " m-eco-card--hover" : ""}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span className="m-eco-card-icon" aria-hidden>
            {feature.icon}
          </span>
          <span className="m-eco-card-title">{feature.title}</span>
        </div>
      </Html>
    </group>
  );
}

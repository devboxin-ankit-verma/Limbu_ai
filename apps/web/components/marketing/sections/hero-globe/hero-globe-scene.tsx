"use client";

import { Float, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  BUSINESS_HUBS,
  EARTH_ROTATION_SPEED,
  createEarthTexture,
  latLngToVector3,
} from "./create-earth-texture";

const EARTH_RADIUS = 1.45;

function CityMarker({ lat, lng }: { lat: number; lng: number }) {
  const pos = useMemo(() => latLngToVector3(lat, lng, EARTH_RADIUS * 1.01), [lat, lng]);
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 0.85 + Math.sin(clock.elapsedTime * 2 + lat) * 0.15;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.028, 12, 12]} />
      <meshBasicMaterial color="#fbbf24" toneMapped={false} />
    </mesh>
  );
}

function EarthGroup({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const earthMap = useMemo(() => createEarthTexture(), []);

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y += delta * EARTH_ROTATION_SPEED;
  });

  return (
    <group ref={groupRef} rotation={[0.12, -0.4, 0.05]}>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshPhysicalMaterial
          map={earthMap}
          roughness={0.55}
          metalness={0.12}
          clearcoat={0.45}
          clearcoatRoughness={0.35}
          envMapIntensity={0.8}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.018, 72, 72]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.06, 48, 48]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {BUSINESS_HUBS.map((hub) => (
        <CityMarker key={hub.label} lat={hub.lat} lng={hub.lng} />
      ))}
    </group>
  );
}

function OrbitRing({ reducedMotion }: { reducedMotion: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current || reducedMotion) return;
    ringRef.current.rotation.z = clock.elapsedTime * 0.08;
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2.8, 0.2, 0]}>
      <torusGeometry args={[2.05, 0.006, 8, 128]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} />
    </mesh>
  );
}

function SceneContent() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 2, 3]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-3, -1, -2]} intensity={0.25} color="#93c5fd" />
      <pointLight position={[2, 1, 2]} intensity={0.6} color="#fbbf24" distance={8} />

      <Stars
        radius={80}
        depth={40}
        count={reducedMotion ? 400 : 1200}
        factor={3.5}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.15}
      />

      <Float
        speed={reducedMotion ? 0 : 1.2}
        rotationIntensity={reducedMotion ? 0 : 0.08}
        floatIntensity={reducedMotion ? 0 : 0.25}
      >
        <EarthGroup reducedMotion={reducedMotion} />
      </Float>

      <OrbitRing reducedMotion={reducedMotion} />
    </>
  );
}

export function HeroGlobeScene() {
  return <SceneContent />;
}

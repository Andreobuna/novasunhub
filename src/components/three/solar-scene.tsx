"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Palette pulled from tailwind.config.ts (solar/brand scales) — three.js
// materials need literal hex values, they can't read the CSS custom
// properties the rest of the app uses.
const SUN_COLOR = "#ffb020";
const SUN_GLOW = "#ffc966";
const RING_COLOR = "#b58cff";
const PANEL_COLOR = "#28075c";
const PANEL_EDGE = "#9757ff";

function SunCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.15;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.035;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.85, 1]} />
      <meshStandardMaterial
        color={SUN_COLOR}
        emissive={SUN_GLOW}
        emissiveIntensity={1.1}
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}

function OrbitRing({ radius, tilt, speed, opacity }: { radius: number; tilt: number; speed: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * speed;
  });

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.008, 8, 96]} />
        <meshBasicMaterial color={RING_COLOR} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function FloatingPanel({ radius, tilt, speed, offset, scale }: {
  radius: number;
  tilt: number;
  speed: number;
  offset: number;
  scale: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  // Reused across renders instead of allocated fresh each time — geometry
  // objects are relatively expensive and this one never actually changes.
  const edgeGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.42, 0.28, 0.02)), []);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    const angle = state.clock.elapsedTime * speed + offset;
    groupRef.current.position.set(Math.cos(angle) * radius, Math.sin(tilt) * Math.sin(angle) * radius, Math.sin(angle) * radius * Math.cos(tilt));
    // Gentle self-tumble so the panel reads as a floating object, not a
    // rigidly-mounted one.
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 + offset;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 + offset;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} scale={scale}>
        <boxGeometry args={[0.42, 0.28, 0.02]} />
        <meshStandardMaterial color={PANEL_COLOR} roughness={0.4} metalness={0.3} />
        <lineSegments>
          <primitive object={edgeGeometry} attach="geometry" />
          <lineBasicMaterial color={PANEL_EDGE} transparent opacity={0.7} />
        </lineSegments>
      </mesh>
    </group>
  );
}

function Scene() {
  // Memoized so orbit/panel configs don't reshuffle on every re-render.
  const panels = useMemo(
    () => [
      { radius: 1.9, tilt: 0.5, speed: 0.22, offset: 0, scale: 1 },
      { radius: 2.3, tilt: -0.35, speed: -0.16, offset: 2.1, scale: 0.8 },
      { radius: 1.6, tilt: 1.1, speed: 0.28, offset: 4.2, scale: 0.65 },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2.2} color={SUN_GLOW} distance={6} decay={2} />
      <directionalLight position={[3, 2, 4]} intensity={0.3} />

      <SunCore />
      <OrbitRing radius={1.5} tilt={0.4} speed={0.12} opacity={0.35} />
      <OrbitRing radius={2.0} tilt={-0.25} speed={-0.08} opacity={0.22} />
      <OrbitRing radius={2.4} tilt={1.0} speed={0.06} opacity={0.15} />

      {panels.map((panel, i) => (
        <FloatingPanel key={i} {...panel} />
      ))}
    </>
  );
}

/**
 * Standalone, self-contained Canvas. Callers are responsible for lazy-loading
 * this (see hero-scene.tsx) — importing it eagerly would pull `three` +
 * `@react-three/fiber` into the initial bundle for every page.
 */
export function SolarScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 4.6], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}

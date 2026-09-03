"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useWebGLSupport } from "@/hooks/use-webgl-support";

// `three` + `@react-three/fiber` are only pulled into the client bundle when
// this actually mounts, and never during SSR (a WebGL canvas has nothing to
// render server-side anyway).
const SolarScene = dynamic(() => import("./solar-scene").then((mod) => mod.SolarScene), {
  ssr: false,
});

/**
 * Pure enhancement layer for the hero: absolutely positioned, pointer-events
 * disabled, renders behind the existing glass HUD card. If WebGL is
 * unavailable or the user prefers reduced motion, this renders nothing and
 * the hero's existing CSS/Framer Motion art (rings, glow orbs, floating
 * chips) carries the section on its own — nothing about the hero's layout
 * depends on this mounting successfully.
 */
export function HeroScene() {
  const webglSupported = useWebGLSupport();
  const reducedMotion = useReducedMotion();

  if (reducedMotion || webglSupported === false || webglSupported === null) {
    return null;
  }

  // No z-index here on purpose: this is mounted as the first child of the
  // hero art's relative container, so normal DOM paint order already puts
  // every later sibling (orbit rings, the glass HUD card, floating chips)
  // on top of it without needing a stacking-context fight.
  return (
    <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden="true">
      <Suspense fallback={null}>
        <SolarScene />
      </Suspense>
    </div>
  );
}

"use client";

import { useCallback, useRef } from "react";

interface UseTiltOptions {
  /** Max rotation in degrees at the pointer's furthest point from center. */
  max?: number;
  /** Subtle scale applied on hover, on top of the tilt. */
  scale?: number;
  disabled?: boolean;
}

/**
 * Pointer-driven perspective tilt, entirely via direct style mutation on the
 * element ref (no React state) so it stays GPU-cheap at 60fps on hover —
 * re-rendering the component tree on every mousemove would be wasteful for
 * something this cosmetic.
 */
export function useTilt<T extends HTMLElement>({ max = 10, scale = 1.015, disabled = false }: UseTiltOptions = {}) {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (disabled || !ref.current) return;
      // No transition while actively tracking the pointer — a CSS
      // transition here fights every incoming mousemove value and produces
      // a laggy, rubber-banded feel instead of the cursor being tracked
      // directly. Transition only kicks in on mouseleave (below).
      ref.current.style.transition = "none";
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-y * max).toFixed(2);
      const rotateY = (x * max).toFixed(2);
      ref.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      ref.current.style.setProperty("--tilt-x", `${(x + 0.5) * 100}%`);
      ref.current.style.setProperty("--tilt-y", `${(y + 0.5) * 100}%`);
    },
    [disabled, max, scale]
  );

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transition = "transform 300ms ease-out";
    ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

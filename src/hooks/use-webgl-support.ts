"use client";

import { useEffect, useState } from "react";

/**
 * Cheap, synchronous-ish WebGL capability check. Some browsers (older
 * mobile Safari, locked-down corporate machines, headless test runners)
 * report a canvas element but throw or return null on context creation —
 * we treat any of that as "no WebGL" and let callers fall back gracefully
 * rather than crash the whole hero section.
 */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  return supported; // null while unknown (pre-mount), then true/false
}

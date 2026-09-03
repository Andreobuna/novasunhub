"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Slim top-of-page loading bar for client-side route transitions.
 *
 * The App Router doesn't expose "navigation started" / "navigation finished"
 * events directly, so this uses the same approach most nprogress-style
 * implementations settle on: patch `history.pushState` to catch the moment
 * Next kicks off a transition, and treat a change in the resolved
 * pathname/search params as "done".
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const start = useCallback(() => {
    if (tickRef.current) return; // already in progress
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setVisible(true);
    setProgress(12);
    // Creeps toward — but never reaches — 90%, so it always looks like it's
    // making progress without ever falsely claiming to be finished.
    tickRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 10));
    }, 200);
  }, []);

  const finish = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setProgress((p) => (p > 0 ? 100 : p));
    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
  }, []);

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);
    window.history.pushState = (...args: Parameters<typeof window.history.pushState>) => {
      start();
      return originalPushState(...args);
    };
    // router.replace() (used for things like redirects and search-param
    // updates) calls replaceState, not pushState — without this, those
    // navigations never showed a progress bar at all.
    window.history.replaceState = (...args: Parameters<typeof window.history.replaceState>) => {
      start();
      return originalReplaceState(...args);
    };
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [start]);

  useEffect(() => {
    // Skip the initial mount — there's no "navigation" to finish yet.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    finish();
    // searchParams is intentionally read via toString(): Next returns a new
    // object reference even when the actual params haven't changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  useEffect(
    () => () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    },
    []
  );

  if (!visible) return null;

  return (
    <div className="fixed left-0 top-0 z-[100] h-[3px] w-full" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-solar-500 via-brand-400 to-solar-400 shadow-glow transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

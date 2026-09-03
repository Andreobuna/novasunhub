interface SolarLoaderProps {
  size?: number;
  label?: string;
}

/**
 * Pure SVG/CSS loader — no canvas, no JS animation loop — so it's cheap to
 * mount on every route transition (`loading.tsx` renders this on the
 * server, before any client JS has hydrated).
 */
export function SolarLoader({ size = 72, label = "Loading" }: SolarLoaderProps) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="motion-reduce:[&_*]:!animate-none"
      >
        <circle
          cx="50"
          cy="50"
          r="36"
          stroke="rgb(var(--border))"
          strokeWidth="1.5"
          strokeDasharray="2 4"
          className="origin-center animate-spin-slow"
        />
        <circle cx="50" cy="50" r="14" className="animate-pulse-ring origin-center" fill="none" stroke="#ffb020" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="13" fill="#ffb020" fillOpacity="0.18" />
        <circle cx="50" cy="50" r="9" fill="#ffb020" />
        <g className="origin-center" style={{ animation: "solar-orbit 1.8s linear infinite" }}>
          <circle cx="50" cy="14" r="4" fill="#9757ff" />
        </g>
      </svg>
      <span className="text-xs font-medium text-muted">{label}…</span>
      {/* globals.css already forces all animation-durations to ~0 under
          prefers-reduced-motion, so this keyframe definition doesn't need
          its own reduced-motion override. */}
      <style>{`
        @keyframes solar-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

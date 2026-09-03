import clsx from "clsx";

/**
 * Temporary brand mark: a stylised sunburst radiating from a solid core,
 * rendered as a hexagon (nods to solar-cell geometry). Pure SVG so it's
 * crisp at any size and adapts to currentColor for light/dark contexts.
 */
export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5 select-none", className)}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="20,2 35,11 35,29 20,38 5,29 5,11" className="fill-brand-500" />
        <g className="stroke-solar-400" strokeWidth="1.6" strokeLinecap="round">
          <line x1="20" y1="10" x2="20" y2="14" />
          <line x1="20" y1="26" x2="20" y2="30" />
          <line x1="11" y1="20" x2="15" y2="20" />
          <line x1="25" y1="20" x2="29" y2="20" />
          <line x1="14" y1="14" x2="16.5" y2="16.5" />
          <line x1="23.5" y1="23.5" x2="26" y2="26" />
          <line x1="26" y1="14" x2="23.5" y2="16.5" />
          <line x1="16.5" y1="23.5" x2="14" y2="26" />
        </g>
        <circle cx="20" cy="20" r="5.2" className="fill-solar-400" />
      </svg>
      {!mark && (
        <span className="font-display text-lg font-semibold tracking-tight text-text">
          Nova<span className="text-brand-400">Sun</span>Hub
        </span>
      )}
    </span>
  );
}

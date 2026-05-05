import { useState } from "react";

function StructuredPoints({
  points = [],
  emptyText = "Not found in document",
  compact = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleCount = compact ? 3 : 4;
  const safePoints = Array.isArray(points) ? points.filter(Boolean) : [];
  const visiblePoints = expanded ? safePoints : safePoints.slice(0, visibleCount);

  if (!safePoints.length) {
    return <p className="text-sm leading-7 text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3.5">
        {visiblePoints.map((point, index) => (
          <li
            key={`${point}-${index}`}
            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-7 text-slate-600"
          >
            <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#4f8f82]" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {safePoints.length > visibleCount ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 transition hover:text-slate-900"
        >
          {expanded ? "Show Less" : `Show ${safePoints.length - visibleCount} More`}
        </button>
      ) : null}
    </div>
  );
}

export default StructuredPoints;
